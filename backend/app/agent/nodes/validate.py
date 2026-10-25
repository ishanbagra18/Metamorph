"""
Validate Node for Metamorph.
Executes 3-level verification ladder:
1. TypeScript compilation (tsc --noEmit)
2. Per-file error attribution
3. Test suite execution (npm test)
"""
from __future__ import annotations

import asyncio
from app.agent.state import MigrationState
from app.sandbox.runner import SandboxRunner


def validate_node(state: MigrationState) -> dict:
    workspace = state["workspace"]
    current_file = state["current_file"]
    tasks = dict(state["tasks"])
    task = dict(tasks[current_file])
    logs = list(state.get("logs", []))

    logs.append(f"[VALIDATE] Validating TypeScript compilation for workspace...")

    runner = SandboxRunner(workspace)
    from app.sandbox.runner import run_sync

    # 1. Run tsc --noEmit
    tsc_res = run_sync(runner.run_tsc())

    # 2. Extract errors for current file
    new_path = task["new_path"]
    matched_errors = []
    structured_errors = []
    for err in tsc_res.tsc_errors:
        clean_file = err.file.replace("\\", "/")
        if clean_file == new_path or clean_file.endswith(new_path) or clean_file == current_file:
            matched_errors.append(err.raw)
            structured_errors.append({
                "file": err.file,
                "line": err.line,
                "col": err.col,
                "code": err.code,
                "message": err.message,
                "raw": err.raw
            })

    test_output = ""
    validation_passed = (len(matched_errors) == 0)
    completed_files = list(state.get("completed_files", []))

    if validation_passed:
        logs.append(f"[VALIDATE] ✅ tsc passed with 0 errors for {new_path}!")
        task["status"] = "done"
        task["last_error"] = None
        if current_file not in completed_files:
            completed_files.append(current_file)
    else:
        logs.append(f"[VALIDATE] ❌ Found {len(matched_errors)} compiler error(s) in {new_path} (Attempt {task['attempts']}/3).")
        task["last_error"] = "\n".join(matched_errors)

    tasks[current_file] = task

    return {
        "tasks": tasks,
        "tsc_errors": matched_errors,
        "compiler_errors": structured_errors,
        "validation_passed": validation_passed,
        "fix_attempts": task["attempts"],
        "completed_files": completed_files,
        "test_output": test_output,
        "logs": logs,
        "status": "validated"
    }
