"""
Run Storage and Persistence Service for Metamorph.
Stores run metadata, state snapshots, and active runs in SQLite.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path
from typing import Dict, List, Optional
from app.config import settings


class StorageService:
    def __init__(self, db_path: Optional[str] = None):
        self.db_path = db_path or settings.RUNS_DB_PATH
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS runs (
                    run_id TEXT PRIMARY KEY,
                    repo_name TEXT,
                    status TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    summary_json TEXT,
                    state_json TEXT
                )
            """)
            conn.commit()

    def create_run(self, run_id: str, repo_name: str, status: str = "created"):
        with self._get_connection() as conn:
            conn.execute(
                "INSERT INTO runs (run_id, repo_name, status, summary_json, state_json) VALUES (?, ?, ?, ?, ?)",
                (run_id, repo_name, status, "{}", "{}")
            )
            conn.commit()

    def update_run_state(self, run_id: str, status: str, state_dict: dict):
        with self._get_connection() as conn:
            # Create a light summary
            summary = {
                "status": status,
                "total_files": len(state_dict.get("tasks", {})),
                "done_files": sum(1 for t in state_dict.get("tasks", {}).values() if t.get("status") == "done"),
                "failed_files": sum(1 for t in state_dict.get("tasks", {}).values() if t.get("status") == "failed"),
                "report": state_dict.get("report", {})
            }

            conn.execute(
                """
                UPDATE runs 
                SET status = ?, updated_at = CURRENT_TIMESTAMP, summary_json = ?, state_json = ?
                WHERE run_id = ?
                """,
                (status, json.dumps(summary), json.dumps(state_dict, default=str), run_id)
            )
            conn.commit()

    def get_run(self, run_id: str) -> Optional[dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM runs WHERE run_id = ?", (run_id,))
            row = cursor.fetchone()
            if not row:
                return None
            return {
                "run_id": row["run_id"],
                "repo_name": row["repo_name"],
                "status": row["status"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"],
                "summary": json.loads(row["summary_json"] or "{}"),
                "state": json.loads(row["state_json"] or "{}")
            }

    def list_runs(self) -> List[dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT run_id, repo_name, status, created_at, updated_at, summary_json FROM runs ORDER BY created_at DESC")
            rows = cursor.fetchall()
            return [
                {
                    "run_id": r["run_id"],
                    "repo_name": r["repo_name"],
                    "status": r["status"],
                    "created_at": r["created_at"],
                    "updated_at": r["updated_at"],
                    "summary": json.loads(r["summary_json"] or "{}")
                }
                for r in rows
            ]

    def delete_run(self, run_id: str):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM runs WHERE run_id = ?", (run_id,))
            conn.commit()


storage = StorageService()
