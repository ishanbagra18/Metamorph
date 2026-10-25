"""
Advance Node for Metamorph.
Progresses the file iterator to the next pending file in the topological plan,
or transitions to final review once all files have been attempted.
"""
from __future__ import annotations

from app.agent.state import MigrationState


def advance_node(state: MigrationState) -> dict:
    tasks = dict(state["tasks"])
    current_file = state.get("current_file")
    logs = list(state.get("logs", []))
    completed_files = list(state.get("completed_files", []))
    failed_files = list(state.get("failed_files", []))

    if current_file and current_file in tasks:
        task = tasks[current_file]
        # If still not done after max attempts, mark failed
        if task["status"] != "done":
            task["status"] = "failed"
            logs.append(f"[ADVANCE] ⚠️ Max compiler repair attempts exhausted for {current_file}. Explicitly marked as FAILED.")
            if current_file not in failed_files:
                failed_files.append(current_file)
            tasks[current_file] = task
        else:
            if current_file not in completed_files:
                completed_files.append(current_file)

    # Find next pending file in plan order
    plan = state.get("plan", [])
    pending = [f for f in plan if tasks.get(f, {}).get("status") == "pending"]

    if pending:
        next_file = pending[0]
        logs.append(f"[ADVANCE] Next file scheduled for migration: {next_file} ({len(pending)} pending remaining)")
        return {
            "tasks": tasks,
            "current_file": next_file,
            "completed_files": completed_files,
            "failed_files": failed_files,
            "logs": logs,
            "status": "advancing"
        }
    else:
        logs.append(f"[ADVANCE] All files processed ({len(completed_files)} succeeded, {len(failed_files)} failed). Transitioning to Review Agent.")
        return {
            "tasks": tasks,
            "current_file": None,
            "completed_files": completed_files,
            "failed_files": failed_files,
            "logs": logs,
            "status": "ready_for_review"
        }
