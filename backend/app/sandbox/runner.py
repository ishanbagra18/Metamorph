"""
Sandbox Runner for Metamorph.
Supports:
1. Docker Sandbox (Phase 1 network ON, Phase 2 network OFF, resource limits)
2. Local Subprocess Sandbox Fallback (when Docker daemon is offline or in local dev)
3. Structured TypeScript Diagnostic Parser
"""
from __future__ import annotations

import asyncio
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Tuple

from app.config import settings

try:
    import docker
    _HAS_DOCKER = True
except Exception:
    _HAS_DOCKER = False


def run_sync(coro):
    """Safely runs an async coroutine synchronously across event loops and worker threads."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = None

    if loop and loop.is_running():
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            return pool.submit(asyncio.run, coro).result()
    else:
        return asyncio.run(coro)



@dataclass
class TscError:
    file: str
    line: int
    col: int
    code: str           # e.g. "TS2322"
    message: str
    raw: str


@dataclass
class ExecutionResult:
    success: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int = 0
    tsc_errors: List[TscError] = None

    def __post_init__(self):
        if self.tsc_errors is None:
            self.tsc_errors = []


class SandboxRunner:
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path).resolve()
        self.docker_client = None
        self._check_docker()

    def _check_docker(self):
        if _HAS_DOCKER and settings.SANDBOX_MODE in ("docker", "auto"):
            try:
                self.docker_client = docker.from_env()
                self.docker_client.ping()
            except Exception:
                self.docker_client = None

    @property
    def is_docker_active(self) -> bool:
        return self.docker_client is not None and settings.SANDBOX_MODE != "subprocess"

    async def run_command(
        self,
        cmd: str,
        network_enabled: bool = False,
        timeout_sec: int = 120
    ) -> ExecutionResult:
        """Executes a command either in Docker or local subprocess based on availability."""
        if self.is_docker_active:
            return await self._run_docker(cmd, network_enabled, timeout_sec)
        else:
            return await self._run_subprocess(cmd, timeout_sec)

    async def _run_subprocess(self, cmd: str, timeout_sec: int) -> ExecutionResult:
        """Subprocess fallback runner."""
        start_time = asyncio.get_event_loop().time()
        try:
            # On Windows, npm/npx/tsc need shell=True or powershell
            is_win = os.name == "nt"
            shell_cmd = f"cmd /c \"{cmd}\"" if is_win else cmd
            
            proc = await asyncio.create_subprocess_shell(
                shell_cmd,
                cwd=str(self.workspace_path),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )

            stdout_bytes, stderr_bytes = await asyncio.wait_for(
                proc.communicate(),
                timeout=timeout_sec
            )
            stdout = stdout_bytes.decode("utf-8", errors="replace")
            stderr = stderr_bytes.decode("utf-8", errors="replace")
            duration_ms = int((asyncio.get_event_loop().time() - start_time) * 1000)

            return ExecutionResult(
                success=(proc.returncode == 0),
                exit_code=proc.returncode,
                stdout=stdout,
                stderr=stderr,
                duration_ms=duration_ms
            )
        except asyncio.TimeoutError:
            return ExecutionResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=f"Command timed out after {timeout_sec}s",
                duration_ms=timeout_sec * 1000
            )
        except Exception as e:
            return ExecutionResult(
                success=False,
                exit_code=-1,
                stdout="",
                stderr=f"Execution error: {str(e)}"
            )

    async def _run_docker(self, cmd: str, network_enabled: bool, timeout_sec: int) -> ExecutionResult:
        """Docker sandbox runner."""
        loop = asyncio.get_event_loop()
        start_time = loop.time()

        def _sync_docker():
            try:
                container = self.docker_client.containers.run(
                    image="node:20-alpine",
                    command=f"sh -c '{cmd}'",
                    volumes={str(self.workspace_path): {"bind": "/app", "mode": "rw"}},
                    working_dir="/app",
                    network_disabled=not network_enabled,
                    mem_limit="512m",
                    nano_cpus=1_000_000_000,  # 1 CPU
                    detach=True,
                    remove=False
                )

                try:
                    res = container.wait(timeout=timeout_sec)
                    exit_code = res.get("StatusCode", 0)
                    logs = container.logs(stdout=True, stderr=True).decode("utf-8", errors="replace")
                    container.remove(force=True)
                    return exit_code, logs, ""
                except Exception as wait_err:
                    container.remove(force=True)
                    return -1, "", str(wait_err)
            except Exception as run_err:
                return -1, "", str(run_err)

        exit_code, stdout, stderr = await loop.run_in_executor(None, _sync_docker)
        duration_ms = int((loop.time() - start_time) * 1000)

        return ExecutionResult(
            success=(exit_code == 0),
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms
        )

    async def install_dependencies(self) -> ExecutionResult:
        """Phase 1: Network enabled npm install."""
        return await self.run_command("npm install --no-audit --prefer-offline", network_enabled=True, timeout_sec=180)

    async def install_package(self, package_name: str) -> ExecutionResult:
        """Installs additional types/dev dependencies."""
        return await self.run_command(f"npm install -D {package_name}", network_enabled=True, timeout_sec=90)

    async def run_tsc(self) -> ExecutionResult:
        """Phase 2: Network disabled TypeScript compile check."""
        result = await self.run_command("npx tsc --noEmit", network_enabled=False, timeout_sec=60)
        result.tsc_errors = self.parse_tsc_output(result.stdout + "\n" + result.stderr)
        return result

    async def run_tests(self) -> ExecutionResult:
        """Phase 2: Network disabled test execution."""
        return await self.run_command("npm test", network_enabled=False, timeout_sec=120)

    @staticmethod
    def parse_tsc_output(output: str) -> List[TscError]:
        """
        Parses output from `tsc --noEmit`.
        Pattern: filepath(line,col): error TSxxxx: message
        e.g. src/utils/helpers.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.
        """
        errors = []
        pattern = re.compile(r"^(.+?)\((\d+),(\d+)\):\s+error\s+(TS\d+):\s+(.+)$", re.MULTILINE)
        
        for match in pattern.finditer(output):
            file_path, line_str, col_str, code, message = match.groups()
            errors.append(TscError(
                file=file_path.strip().replace("\\", "/"),
                line=int(line_str),
                col=int(col_str),
                code=code.strip(),
                message=message.strip(),
                raw=match.group(0).strip()
            ))
        return errors

    @staticmethod
    def group_errors_by_file(errors: List[TscError]) -> Dict[str, List[TscError]]:
        """Groups errors by relative file path."""
        grouped: Dict[str, List[TscError]] = {}
        for err in errors:
            grouped.setdefault(err.file, []).append(err)
        return grouped
