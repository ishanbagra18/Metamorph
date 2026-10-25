"""
Test Metamorph Multi-Agent + Qdrant RAG on user repository:
https://github.com/ishanbagra18/Resume.git
"""
import os
import sys
import shutil
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.analysis.dep_graph import DependencyGraphBuilder
from app.analysis.toposort import TopoPlanner
from app.agent.graph import migration_app
from app.services.repo_service import RepoService
from app.services.storage import storage

repo_url = "https://github.com/ishanbagra18/Resume.git"
run_id = "resume_test"

print(f"=== 1. CLONING REPOSITORY: {repo_url} ===")
orig_path, ws_path = RepoService.create_workspace(run_id)

# Clean if exists from earlier
if orig_path.exists():
    shutil.rmtree(orig_path, ignore_errors=True)
if ws_path.exists():
    shutil.rmtree(ws_path, ignore_errors=True)
orig_path.mkdir(parents=True, exist_ok=True)
ws_path.mkdir(parents=True, exist_ok=True)

try:
    RepoService.clone_git_repo(repo_url, orig_path)
    print(f"Repository cloned successfully into: {orig_path}")
except Exception as e:
    print(f"Error cloning repository: {e}")
    sys.exit(1)

# Duplicate into workspace for migration
RepoService.duplicate_for_migration(orig_path, ws_path)

# 2. Inspect Files Found in Repo
print("\n=== 2. INSPECTING REPOSITORY STRUCTURE ===")
builder = DependencyGraphBuilder(str(ws_path))
all_js_files = builder.scan_repo()
print(f"JavaScript files discovered: {len(all_js_files)}")
for f in all_js_files:
    print(f"  - {f}")

all_files = [p.relative_to(ws_path).as_posix() for p in ws_path.rglob("*") if p.is_file() and not p.name.startswith(".git")]
print(f"Total files in repository: {len(all_files)}")
for f in all_files[:15]:
    print(f"    {f}")

if not all_js_files:
    print("\n[NOTE] No JavaScript files discovered in this repository (it may be static HTML/CSS, Markdown, or already TypeScript).")
    print("Files present:")
    for f in all_files:
        print(f"  {f}")
    sys.exit(0)

# 3. Build Graph and Plan
graph, file_asts, exts = builder.build_graph()
print(f"\nDependency Graph: {graph}")
print(f"External Packages: {exts}")

planner = TopoPlanner(graph)
plan, cycles, detailed_steps = planner.analyze_plan()
print(f"Topological Migration Plan: {plan}")
print(f"Circular Cycles: {cycles}")

# 4. Execute Full LangGraph Multi-Agent Workflow
print("\n=== 3. EXECUTING METAMORPH MULTI-AGENT + RAG WORKFLOW ===")
initial_state = {
    "run_id": run_id,
    "repo_id": run_id,
    "repo_path": str(orig_path),
    "workspace": str(ws_path),
    "dep_graph": {},
    "cycles": [],
    "plan": [],
    "detailed_steps": [],
    "tasks": {},
    "current_file": None,
    "retrieved_context": [],
    "compiler_errors": [],
    "baseline_tests_passed": None,
    "tsc_errors": [],
    "test_output": "",
    "global_attempts": 0,
    "fix_attempts": 0,
    "validation_passed": False,
    "completed_files": [],
    "failed_files": [],
    "status": "initializing",
    "report": {},
    "logs": [f"Run initialized for {run_id} ({repo_url})"],
    "approval_granted": True
}

config = {"configurable": {"thread_id": run_id}}
final_state = migration_app.invoke(initial_state, config=config)

print(f"\n=== 4. MIGRATION WORKFLOW COMPLETE ===")
print(f"Final Status: {final_state['status']}")
print(f"Total Tasks Processed: {len(final_state['tasks'])}")
for f, task in final_state['tasks'].items():
    print(f"  {task['path']} -> {task['new_path']} | Status: {task['status']} | Attempts: {task['attempts']}")

if final_state.get('report'):
    rep = final_state['report']
    print("\nSummary Report:")
    print(f"  Pass Rate: {rep.get('pass_rate')}%")
    rev = rep.get('review', {})
    print(f"  Quality Score: {rev.get('quality_score')}/100")
    print(f"  Total 'any' count: {rev.get('total_any_count')}")
    print(f"  Download ZIP: {rep.get('download_zip_path')}")

print("\nRecent Logs:")
for log in final_state.get('logs', [])[-10:]:
    print(f"  {log}")
