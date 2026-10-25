"""
Plan Node for Metamorph.
Calculates topological migration order, groups circular dependencies,
and sets up TypeScript configuration (tsconfig.json + package.json).
"""
from __future__ import annotations

import json
from pathlib import Path
from app.agent.state import MigrationState
from app.analysis.toposort import TopoPlanner


DEFAULT_TSCONFIG = {
    "compilerOptions": {
        "target": "ES2022",
        "module": "NodeNext",
        "moduleResolution": "NodeNext",
        "esModuleInterop": True,
        "allowSyntheticDefaultImports": True,
        "strict": True,
        "noImplicitAny": True,
        "skipLibCheck": True,
        "forceConsistentCasingInFileNames": True,
        "outDir": "./dist",
        "rootDir": "./",
        "types": ["node"]
    },
    "include": ["**/*.ts", "**/*.tsx"],
    "exclude": ["node_modules", "dist"]
}


def plan_node(state: MigrationState) -> dict:
    dep_graph = state["dep_graph"]
    workspace = Path(state["workspace"])
    logs = list(state.get("logs", []))
    logs.append("[PLAN] Computing topological migration sequence...")

    # Compute topological sort and circular cycles
    planner = TopoPlanner(dep_graph)
    plan, cycles, detailed_steps = planner.analyze_plan()

    if cycles:
        logs.append(f"[PLAN] Circular dependencies detected! Grouped {len(cycles)} cycles for coordinated migration.")
    else:
        logs.append(f"[PLAN] Linear dependency DAG established. Migration order: {len(plan)} files.")

    # Generate tsconfig.json if not present
    tsconfig_path = workspace / "tsconfig.json"
    if not tsconfig_path.exists():
        tsconfig_path.write_text(json.dumps(DEFAULT_TSCONFIG, indent=2), encoding="utf-8")
        logs.append("[PLAN] Generated optimal tsconfig.json.")

    # Update package.json to include TypeScript dependencies
    package_json_path = workspace / "package.json"
    if package_json_path.exists():
        try:
            pkg = json.loads(package_json_path.read_text(encoding="utf-8"))
            dev_deps = pkg.setdefault("devDependencies", {})
            dev_deps.setdefault("typescript", "^5.5.0")
            dev_deps.setdefault("@types/node", "^20.0.0")
            if "express" in pkg.get("dependencies", {}) or any("express" in d for d in dep_graph):
                dev_deps.setdefault("@types/express", "^4.17.21")

            package_json_path.write_text(json.dumps(pkg, indent=2), encoding="utf-8")
            logs.append("[PLAN] Added TypeScript & @types devDependencies to package.json.")
        except Exception as e:
            logs.append(f"[PLAN] Warning: Could not update package.json: {e}")

    # Set initial current_file to first pending file in plan
    first_file = plan[0] if plan else None

    return {
        "plan": plan,
        "cycles": cycles,
        "detailed_steps": detailed_steps,
        "current_file": first_file,
        "status": "planned",
        "logs": logs
    }
