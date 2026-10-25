"""
Review Node for Metamorph.
Performs quality audits across all migrated TypeScript files:
- Counts usages of `any`
- Detects `@ts-ignore` and `@ts-expect-error` suppression comments
- Computes Health Score (0-100)
"""
from __future__ import annotations

import re
from pathlib import Path
from app.agent.state import MigrationState


def review_node(state: MigrationState) -> dict:
    tasks = state["tasks"]
    workspace = Path(state["workspace"])
    logs = list(state.get("logs", []))

    logs.append("[REVIEW] Running final code quality and type-safety audit...")

    total_any_count = 0
    total_ignore_count = 0
    files_reviewed = 0

    per_file_findings = []
    for f, task in tasks.items():
        if task.get("status") in ("done", "failed") and task.get("new_path"):
            ts_file = workspace / task["new_path"]
            if ts_file.exists():
                code = ts_file.read_text(encoding="utf-8", errors="replace")
                files_reviewed += 1
                
                # Count `any` (excluding strings/comments loosely)
                anys = len(re.findall(r':\s*any\b|\bas\s+any\b|<any>', code))
                total_any_count += anys

                # Count ts-ignore directives
                ignores = len(re.findall(r'@ts-ignore|@ts-expect-error', code))
                total_ignore_count += ignores

                if anys > 0 or ignores > 0 or task["status"] == "failed":
                    per_file_findings.append({
                        "file": task["new_path"],
                        "status": task["status"],
                        "any_count": anys,
                        "ignore_count": ignores,
                        "attempts": task.get("attempts", 1),
                        "last_error": task.get("last_error")
                    })

    total_tasks = len(tasks)
    successful_tasks = sum(1 for t in tasks.values() if t["status"] == "done")
    failed_tasks = total_tasks - successful_tasks

    # Calculate Quality Score (0 - 100)
    penalty = (failed_tasks * 20) + (total_any_count * 2) + (total_ignore_count * 3)
    quality_score = max(0, min(100, 100 - penalty))

    logs.append(f"[REVIEW] Audit complete. Successful: {successful_tasks}/{total_tasks}, Quality Score: {quality_score}/100 ('any' count: {total_any_count}, ts-ignores: {total_ignore_count})")

    review_data = {
        "files_reviewed": files_reviewed,
        "total_any_count": total_any_count,
        "total_ignore_count": total_ignore_count,
        "quality_score": quality_score,
        "successful_tasks": successful_tasks,
        "failed_tasks": failed_tasks,
        "findings": per_file_findings
    }

    return {
        "report": {**state.get("report", {}), "review": review_data},
        "review_findings": per_file_findings,
        "logs": logs,
        "status": "reviewed"
    }
