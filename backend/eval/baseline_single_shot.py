"""
Baseline Single-Shot Migration Runner.
Migrates an entire repo in a single LLM pass with no AST topological plan,
no feedback loop, and no self-healing retries.
Used as the benchmark control to demonstrate the superior pass-rate of Metamorph.
"""
from __future__ import annotations

import os
from pathlib import Path
from langchain_core.messages import SystemMessage, HumanMessage
from app.agent.llm import LLMFactory
from app.sandbox.runner import SandboxRunner


def run_single_shot_migration(workspace_dir: str) -> dict:
    workspace = Path(workspace_dir)
    js_files = [f for f in workspace.rglob("*.js") if "node_modules" not in str(f) and ".git" not in str(f)]

    model = LLMFactory.get_model()
    migrated_count = 0

    for js_path in js_files:
        code = js_path.read_text(encoding="utf-8", errors="replace")
        prompt = f"Convert this JS file to TS:\n```javascript\n{code}\n```"
        
        try:
            res = model.invoke([
                SystemMessage(content="Convert JavaScript to TypeScript. Return only code."),
                HumanMessage(content=prompt)
            ])
            raw = res.content if hasattr(res, "content") else str(res)
            
            # Clean markdown fences
            if "```typescript" in raw:
                raw = raw.split("```typescript")[1].split("```")[0]
            elif "```ts" in raw:
                raw = raw.split("```ts")[1].split("```")[0]
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0]

            ts_path = js_path.with_suffix(".ts")
            ts_path.write_text(raw.strip(), encoding="utf-8")
            js_path.unlink()
            migrated_count += 1
        except Exception:
            pass

    # Run tsc check
    import asyncio
    runner = SandboxRunner(str(workspace))
    tsc_res = asyncio.run(runner.run_tsc())

    return {
        "approach": "single_shot_baseline",
        "total_files": len(js_files),
        "migrated_files": migrated_count,
        "tsc_passed": tsc_res.success,
        "tsc_errors_count": len(tsc_res.tsc_errors)
    }
