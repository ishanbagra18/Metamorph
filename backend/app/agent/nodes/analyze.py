"""
Analyze Node for Metamorph.
Builds AST Dependency Graph and executes baseline test validation on original code.
"""
from __future__ import annotations

import asyncio
from pathlib import Path
from app.agent.state import MigrationState
from app.analysis.dep_graph import DependencyGraphBuilder
from app.sandbox.runner import SandboxRunner


def analyze_node(state: MigrationState) -> dict:
    workspace = state["workspace"]
    repo_path = state["repo_path"]
    run_id = state.get("run_id", "default_run")
    repo_id = state.get("repo_id") or run_id
    logs = list(state.get("logs", []))
    logs.append("[ANALYZE] Parsing AST and mapping dependencies...")

    # 1. Build AST dependency graph
    builder = DependencyGraphBuilder(workspace)
    dep_graph, file_asts, external_packages = builder.build_graph()

    logs.append(f"[ANALYZE] Mapped {len(dep_graph)} files. External packages found: {list(external_packages)[:5]}...")

    # 2. AST-Aware Code Chunking and Vector Indexing into Qdrant
    indexed_count = 0
    try:
        from app.rag.chunker import CodeChunker
        from app.rag.indexer import QdrantCodeIndexer

        chunker = CodeChunker()
        indexer = QdrantCodeIndexer()
        all_chunks = []

        for rel_path, ast in file_asts.items():
            code = ast.raw_code
            if not code:
                f_path = Path(workspace) / rel_path
                if f_path.exists():
                    code = f_path.read_text(encoding="utf-8", errors="replace")
            if code:
                chunks = chunker.chunk_file(
                    repo_id=repo_id,
                    file_path=rel_path,
                    code=code,
                    language="javascript"
                )
                all_chunks.extend(chunks)

        if all_chunks:
            indexed_count = indexer.index_chunks(all_chunks)
            logs.append(f"[RAG INDEX] Extracted {len(all_chunks)} semantic AST chunks. Indexed {indexed_count} new vectors into Qdrant collection 'code_chunks'.")
    except Exception as e:
        logs.append(f"[RAG INDEX] Warning: Qdrant indexing encountered non-fatal error: {e}")

    # 3. Check baseline tests in original repo (read-only copy)
    baseline_passed = None
    runner = SandboxRunner(repo_path)
    try:
        from app.sandbox.runner import run_sync
        test_res = run_sync(runner.run_tests())
        baseline_passed = test_res.success
        logs.append(f"[ANALYZE] Baseline original tests run: {'PASSED' if baseline_passed else 'FAILED/NOT PRESENT'}")
    except Exception as e:
        logs.append(f"[ANALYZE] Baseline test check skipped: {e}")

    analysis_data = {
        "file_count": len(dep_graph),
        "external_packages": list(external_packages),
        "indexed_chunks": indexed_count,
        "repo_id": repo_id
    }

    return {
        "repo_id": repo_id,
        "dep_graph": dep_graph,
        "baseline_tests_passed": baseline_passed,
        "analysis": analysis_data,
        "logs": logs,
        "status": "analyzed"
    }
