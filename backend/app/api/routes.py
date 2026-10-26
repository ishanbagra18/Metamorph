"""
REST API Routes for Metamorph.
Handles uploads, git cloning, starting migration runs, inspection, and downloads.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import uuid
from pathlib import Path
from typing import Optional
from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from app.agent.graph import migration_app
from app.agent.state import MigrationState
from app.api.ws import ws_manager
from app.config import settings
from app.services.repo_service import RepoService
from app.services.storage import storage

router = APIRouter()


class GitCloneRequest(BaseModel):
    git_url: str
    branch: Optional[str] = None


async def execute_migration_runner(run_id: str, original_path: Path, workspace_path: Path):
    """Executes the LangGraph workflow and broadcasts live WebSocket events."""
    storage.update_run_state(run_id, "running", {})
    await ws_manager.broadcast(run_id, "run_started", {"run_id": run_id, "status": "running"})

    initial_state: MigrationState = {
        "run_id": run_id,
        "repo_path": str(original_path),
        "workspace": str(workspace_path),
        "dep_graph": {},
        "cycles": [],
        "plan": [],
        "detailed_steps": [],
        "tasks": {},
        "current_file": None,
        "baseline_tests_passed": None,
        "tsc_errors": [],
        "test_output": "",
        "global_attempts": 0,
        "status": "initializing",
        "report": {},
        "logs": [f"Run initialized for {run_id}"],
        "approval_granted": True
    }

    config = {"configurable": {"thread_id": run_id}}

    try:
        current_state = initial_state
        async for output in migration_app.astream(initial_state, config=config):
            for node_name, node_output in output.items():
                current_state = {**current_state, **node_output}

                # Broadcast node update
                await ws_manager.broadcast(run_id, "node_transition", {
                    "node": node_name,
                    "status": current_state.get("status"),
                    "current_file": current_state.get("current_file"),
                    "logs": current_state.get("logs", [])[-3:],
                    "tasks": current_state.get("tasks", {})
                })

        storage.update_run_state(run_id, "completed", current_state)
        await ws_manager.broadcast(run_id, "run_completed", {
            "run_id": run_id,
            "report": current_state.get("report", {}),
            "status": "completed"
        })
    except Exception as e:
        error_msg = f"Migration execution crashed: {str(e)}"
        current_state["logs"].append(error_msg)
        storage.update_run_state(run_id, "failed", current_state)
        await ws_manager.broadcast(run_id, "run_failed", {"run_id": run_id, "error": error_msg})


@router.post("/upload")
async def upload_repo(file: UploadFile = File(...)):
    """Uploads a ZIP file of a Node.js Express repository."""
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Only .zip files are supported.")

    run_id = str(uuid.uuid4())[:8]
    original_path, workspace_path = RepoService.create_workspace(run_id)

    # Save uploaded zip temporarily
    temp_zip = original_path.parent / "uploaded.zip"
    with open(temp_zip, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract into original
    try:
        RepoService.extract_zip(str(temp_zip), original_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to unpack zip: {e}")
    finally:
        if temp_zip.exists():
            temp_zip.unlink()

    # Duplicate to workspace
    RepoService.duplicate_for_migration(original_path, workspace_path)

    storage.create_run(run_id, file.filename, status="ready")

    return {
        "run_id": run_id,
        "repo_name": file.filename,
        "status": "ready",
        "message": "Repository uploaded and workspace prepared."
    }


@router.post("/clone")
async def clone_repo(req: GitCloneRequest):
    """Clones a public Git repository."""
    run_id = str(uuid.uuid4())[:8]
    original_path, workspace_path = RepoService.create_workspace(run_id)

    try:
        RepoService.clone_git_repo(req.git_url, original_path, req.branch)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    RepoService.duplicate_for_migration(original_path, workspace_path)
    repo_name = req.git_url.rstrip("/").split("/")[-1]
    storage.create_run(run_id, repo_name, status="ready")

    return {
        "run_id": run_id,
        "repo_name": repo_name,
        "status": "ready",
        "message": "Repository cloned and workspace prepared."
    }


@router.post("/runs/{run_id}/start")
async def start_run(run_id: str, background_tasks: BackgroundTasks):
    """Initiates the autonomous migration agent on the prepared workspace."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")

    original_path = Path(settings.WORKSPACES_DIR) / run_id / "original"
    workspace_path = Path(settings.WORKSPACES_DIR) / run_id / "migrated"

    if not original_path.exists() or not workspace_path.exists():
        raise HTTPException(status_code=404, detail="Workspace files not found on disk.")

    background_tasks.add_task(execute_migration_runner, run_id, original_path, workspace_path)

    return {"run_id": run_id, "status": "started", "message": "Migration pipeline running in background."}


@router.get("/runs/{run_id}")
async def get_run_details(run_id: str):
    """Fetches real-time status and state for a specific run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")
    return run


@router.get("/runs")
async def list_all_runs():
    """Lists all historical and active migration runs."""
    return storage.list_runs()


@router.get("/runs/{run_id}/download")
async def download_migrated_zip(run_id: str):
    """Downloads the migrated TypeScript repository ZIP."""
    reports_dir = Path(settings.REPORTS_DIR)
    zip_path = reports_dir / f"metamorph-{run_id}.zip"

    if not zip_path.exists():
        # Check if workspace exists to package on demand
        workspace_path = Path(settings.WORKSPACES_DIR) / run_id / "migrated"
        if workspace_path.exists():
            RepoService.package_migrated_zip(workspace_path, zip_path)
        else:
            raise HTTPException(status_code=404, detail="Archive not ready or run not found.")

    return FileResponse(
        path=str(zip_path),
        filename=f"metamorph-migrated-{run_id}.zip",
        media_type="application/zip"
    )


@router.delete("/runs/{run_id}")
async def delete_run(run_id: str):
    """Deletes a run and cleans up disk artifacts."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")

    storage.delete_run(run_id)

    # Clean up workspace
    workspace = Path(settings.WORKSPACES_DIR) / run_id
    if workspace.exists():
        shutil.rmtree(workspace, ignore_errors=True)

    # Clean up zipped report
    report_zip = Path(settings.REPORTS_DIR) / f"metamorph-{run_id}.zip"
    if report_zip.exists():
        report_zip.unlink(missing_ok=True)

    return {"message": f"Run {run_id} deleted successfully."}


@router.post("/runs/{run_id}/cancel")
async def cancel_run(run_id: str):
    """Cancels an ongoing migration run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")

    state = run.get("state") or {}
    state["status"] = "cancelled"
    state.setdefault("logs", []).append("Migration run cancelled by user.")
    storage.update_run_state(run_id, "cancelled", state)

    await ws_manager.broadcast(run_id, "run_failed", {
        "run_id": run_id,
        "error": "Migration cancelled by user."
    })
    return {"message": f"Run {run_id} marked as cancelled."}


@router.get("/runs/{run_id}/report")
async def get_run_report(run_id: str):
    """Returns the markdown and structured report for a run."""
    run = storage.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found.")

    state = run.get("state") or {}
    report = state.get("report") or {}
    report_file = Path(settings.WORKSPACES_DIR) / run_id / "migrated" / "MIGRATION_REPORT.md"
    markdown_content = ""
    if report_file.exists():
        try:
            markdown_content = report_file.read_text(encoding="utf-8")
        except Exception:
            markdown_content = ""

    return {
        "run_id": run_id,
        "repo_name": run.get("repo_name"),
        "status": run.get("status"),
        "report": report,
        "markdown": markdown_content or report.get("executive_summary", "")
    }
