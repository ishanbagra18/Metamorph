"""
Ingest Node for Metamorph.
Verifies repo structure, checks package.json, detects Express, and initializes FileTasks.
"""
from __future__ import annotations

import json
from pathlib import Path
from app.agent.state import FileTask, MigrationState


def ingest_node(state: MigrationState) -> dict:
    workspace = Path(state["workspace"])
    package_json_path = workspace / "package.json"

    logs = list(state.get("logs", []))
    logs.append(f"[INGEST] Initializing workspace: {workspace}")

    has_package_json = package_json_path.is_file()
    has_express = False
    pkg_data = {}

    if has_package_json:
        try:
            pkg_data = json.loads(package_json_path.read_text(encoding="utf-8"))
            deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
            has_express = "express" in deps
            logs.append(f"[INGEST] Found package.json. Express detected: {has_express}")
        except Exception as e:
            logs.append(f"[INGEST] Warning: Failed to parse package.json: {e}")
    else:
        logs.append("[INGEST] Notice: No package.json found. Creating default configuration.")

    # Find JS files
    from app.analysis.dep_graph import DependencyGraphBuilder
    builder = DependencyGraphBuilder(str(workspace))
    js_files = builder.scan_repo()
    logs.append(f"[INGEST] Discovered {len(js_files)} JavaScript files to migrate.")

    tasks = {}
    for f in js_files:
        original_file = workspace / f
        try:
            code = original_file.read_text(encoding="utf-8", errors="replace")
        except Exception:
            code = ""

        # Determine TS extension (.ts or .tsx)
        ext = ".tsx" if ".jsx" in f or "<" in code and "/>" in code else ".ts"
        new_path = str(Path(f).with_suffix(ext)).replace("\\", "/")

        tasks[f] = FileTask(
            path=f,
            new_path=new_path,
            status="pending",
            attempts=0,
            last_error=None,
            original_code=code,
            migrated_code=None,
            diff=None,
            notes=None
        )

    return {
        "tasks": tasks,
        "logs": logs,
        "status": "ingested"
    }
