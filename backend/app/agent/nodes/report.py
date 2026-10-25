"""
Report Node for Metamorph.
Generates comprehensive MIGRATION_REPORT.md and packages the final migrated
TypeScript repository into a downloadable ZIP archive.
"""
from __future__ import annotations

import json
from pathlib import Path
from app.agent.state import MigrationState
from app.config import settings
from app.services.repo_service import RepoService


def report_node(state: MigrationState) -> dict:
    run_id = state["run_id"]
    workspace = Path(state["workspace"])
    tasks = state["tasks"]
    logs = list(state.get("logs", []))

    logs.append("[REPORT] Generating final migration report and packaging archive...")

    total_files = len(tasks)
    successful_files = sum(1 for t in tasks.values() if t["status"] == "done")
    failed_files = total_files - successful_files
    pass_rate = round((successful_files / total_files * 100), 1) if total_files > 0 else 100.0

    review = state.get("report", {}).get("review", {})
    quality_score = review.get("quality_score", 100)
    total_any_count = review.get("total_any_count", 0)
    total_ignore_count = review.get("total_ignore_count", 0)
    indexed_chunks = state.get("analysis", {}).get("indexed_chunks", 0)

    # 1. Generate Markdown Report
    report_md = f"""# 🦋 Metamorph Migration Report
**Run ID:** `{run_id}`  
**Target:** JavaScript → TypeScript (Node.js / Express)

---

## 📊 Summary Metrics
| Metric | Value |
| :--- | :--- |
| **Total Files Analyzed** | `{total_files}` |
| **Successfully Migrated** | `{successful_files}` |
| **Failed Files** | `{failed_files}` |
| **Pass Rate** | **`{pass_rate}%`** |
| **Quality Score** | **`{quality_score}/100`** |
| **Qdrant RAG Chunks Indexed** | `{indexed_chunks}` |
| **Total `any` Invocations** | `{total_any_count}` |
| **`@ts-ignore` Directives** | `{total_ignore_count}` |
| **Baseline JS Tests Passed** | `{state.get('baseline_tests_passed', 'N/A')}` |

---

## 📁 File Breakdown
| Original JS File | Migrated TS File | Status | Attempts |
| :--- | :--- | :--- | :--- |
"""

    for path, task in tasks.items():
        status_emoji = "✅ Done" if task["status"] == "done" else "❌ Failed"
        report_md += f"| `{task['path']}` | `{task['new_path']}` | {status_emoji} | {task['attempts']} |\n"

    # Add diagnostic errors for failed files
    failed_items = [t for t in tasks.values() if t["status"] == "failed"]
    if failed_items:
        report_md += "\n---\n\n## ⚠️ Failed Files Diagnostic Summary\n"
        for item in failed_items:
            report_md += f"### `{item['new_path']}`\n"
            report_md += f"**Attempts:** {item['attempts']}/3\n\n"
            if item.get("last_error"):
                report_md += f"```\n{item['last_error']}\n```\n"

    report_md += """
---
*Generated autonomously by **Metamorph: Multi-Agent & RAG-Powered JS -> TS Migration Engine**.*
"""

    # Write report into workspace
    report_file = workspace / "MIGRATION_REPORT.md"
    report_file.write_text(report_md, encoding="utf-8")

    # 2. Package into ZIP
    reports_dir = Path(settings.REPORTS_DIR)
    reports_dir.mkdir(parents=True, exist_ok=True)
    zip_path = reports_dir / f"metamorph-{run_id}.zip"

    RepoService.package_migrated_zip(workspace, zip_path)
    logs.append(f"[REPORT] Created download ZIP archive at: {zip_path}")

    final_report = {
        "run_id": run_id,
        "total_files": total_files,
        "successful_files": successful_files,
        "failed_files": failed_files,
        "pass_rate": pass_rate,
        "quality_score": quality_score,
        "total_any_count": total_any_count,
        "total_ignore_count": total_ignore_count,
        "baseline_tests_passed": state.get("baseline_tests_passed"),
        "download_zip_path": str(zip_path),
        "report_markdown": report_md
    }

    logs.append("[REPORT] Migration run successfully finished!")

    return {
        "report": final_report,
        "logs": logs,
        "status": "completed"
    }
