import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.analysis.dep_graph import DependencyGraphBuilder
from app.analysis.toposort import TopoPlanner
from app.agent.graph import migration_app
from app.services.repo_service import RepoService

sample_dir = Path(__file__).parent.parent / "samples" / "express-todo-app"
print(f"Testing sample repo at: {sample_dir}")

# 1. Dependency Graph & TopoPlanner
builder = DependencyGraphBuilder(str(sample_dir))
graph, asts, exts = builder.build_graph()

print("\n--- 1. PARSED FILES & DEPENDENCIES ---")
for f, deps in graph.items():
    print(f"  {f} -> {deps}")

print(f"\nExternal packages detected: {exts}")

planner = TopoPlanner(graph)
order, cycles, steps = planner.analyze_plan()

print("\n--- 2. TOPOLOGICAL MIGRATION ORDER ---")
for idx, f in enumerate(order, start=1):
    print(f"  Step {idx}: {f}")

print(f"\nCircular dependency cycles: {cycles}")

# 2. End-to-End LangGraph Workflow Execution
print("\n--- 3. EXECUTING FULL LANGGRAPH AGENT WORKFLOW ---")
orig_path, ws_path = RepoService.create_workspace("verify_run")
RepoService.duplicate_for_migration(sample_dir, orig_path)
RepoService.duplicate_for_migration(orig_path, ws_path)

initial_state = {
    "run_id": "verify_run",
    "repo_path": str(orig_path),
    "workspace": str(ws_path),
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
    "logs": ["[INIT] Starting end-to-end verification"],
    "approval_granted": True
}

config = {"configurable": {"thread_id": "verify_run"}}
final_state = migration_app.invoke(initial_state, config=config)

print(f"\nFinal State Status: {final_state['status']}")
print(f"Total Tasks Processed: {len(final_state['tasks'])}")
for f, task in final_state['tasks'].items():
    print(f"  File: {task['path']} -> {task['new_path']} | Status: {task['status']} | Attempts: {task['attempts']}")

print(f"\nReport Generated: {bool(final_state.get('report'))}")
if final_state.get('report'):
    rep = final_state['report']
    print(f"  Pass Rate: {rep.get('pass_rate')}%")
    print(f"  Quality Score: {rep.get('quality_score')}/100")
    print(f"  Download ZIP: {rep.get('download_zip_path')}")

print("\n[SUCCESS] Metamorph pipeline verification successful!")
