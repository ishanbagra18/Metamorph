"""
Migrate File Node for Metamorph.
Core transformation node that invokes the LLM to migrate a JavaScript file to TypeScript
with upstream type signature awareness.
"""
from __future__ import annotations

from pathlib import Path
from langchain_core.messages import SystemMessage, HumanMessage
from app.agent.llm import LLMFactory
from app.agent.prompts import (
    SYSTEM_MIGRATION_PROMPT,
    MIGRATE_FILE_USER_PROMPT,
    FEW_SHOT_INPUT_JS,
    FEW_SHOT_OUTPUT_TS
)
from app.agent.state import FileMigrationOutput, MigrationState
from app.services.repo_service import RepoService


def migrate_file_node(state: MigrationState) -> dict:
    current_file = state["current_file"]
    if not current_file:
        return {"status": "no_current_file"}

    tasks = dict(state["tasks"])
    task = dict(tasks[current_file])
    workspace = Path(state["workspace"])
    logs = list(state.get("logs", []))

    logs.append(f"[MIGRATE] Converting {current_file} -> {task['new_path']}")

    # 1. RAG Context Retrieval from Qdrant Vector Store & Symbol Matching
    repo_id = state.get("repo_id") or state.get("run_id", "default_run")
    imported_files = state["dep_graph"].get(current_file, [])
    
    # Extract AST symbols from current file
    from app.analysis.ast_extractor import ASTExtractor
    extractor = ASTExtractor()
    ast = extractor.parse(current_file, task["original_code"])
    ast_symbols = [f.name for f in ast.functions] + [e.name for e in ast.exports]

    retrieved_snippets = []
    rag_context_text = "None."
    try:
        from app.rag.retriever import CodeRetriever
        retriever = CodeRetriever()
        retrieved_snippets = retriever.retrieve_context_for_file(
            repo_id=repo_id,
            current_file=current_file,
            imported_files=imported_files,
            ast_symbols=ast_symbols,
            top_k=4
        )
        rag_context_text = retriever.format_context_for_prompt(retrieved_snippets)
        logs.append(f"[RAG RETRIEVE] Retrieved {len(retrieved_snippets)} relevant code snippets & interfaces from Qdrant for {current_file}.")
    except Exception as e:
        logs.append(f"[RAG RETRIEVE] Context retrieval note: {e}")

    # 2. Collect upstream type signatures from already-migrated dependencies
    upstream_signatures = []
    for dep in imported_files:
        dep_task = tasks.get(dep)
        if dep_task and dep_task.get("notes"):
            upstream_signatures.append(f"// From {dep}:\n{dep_task['notes']}")

    upstream_context = "\n\n".join(upstream_signatures) if upstream_signatures else "None (This is a root/leaf file or only uses external npm packages)."

    # 3. Prepare LLM Prompt with RAG context
    model = LLMFactory.get_model(temperature=0.0)
    structured_llm = model.with_structured_output(FileMigrationOutput)

    messages = [
        SystemMessage(content=SYSTEM_MIGRATION_PROMPT),
        HumanMessage(content=f"EXAMPLE JS INPUT:\n{FEW_SHOT_INPUT_JS}"),
        HumanMessage(content=f"EXAMPLE TS OUTPUT:\n{FEW_SHOT_OUTPUT_TS}"),
        HumanMessage(content=MIGRATE_FILE_USER_PROMPT.format(
            file_path=task["path"],
            new_path=task["new_path"],
            rag_context=rag_context_text,
            upstream_context=upstream_context,
            code_lang="javascript",
            code=task["original_code"]
        ))
    ]

    try:
        output: FileMigrationOutput = structured_llm.invoke(messages)
        new_ts_code = output.new_code
        notes = output.notes or ", ".join(output.exported_signatures)
    except Exception as e:
        logs.append(f"[MIGRATE] LLM invocation failed for {current_file}: {e}. Applying fallback transpilation.")
        from app.agent.llm import MockMigrationLLM
        mock_output = MockMigrationLLM().with_structured_output(FileMigrationOutput).invoke(messages)
        new_ts_code = mock_output.new_code
        notes = mock_output.notes

    # 4. Write new TypeScript file and remove original JS from workspace
    new_ts_file = workspace / task["new_path"]
    new_ts_file.parent.mkdir(parents=True, exist_ok=True)
    new_ts_file.write_text(new_ts_code, encoding="utf-8")

    old_js_file = workspace / task["path"]
    if old_js_file.exists() and old_js_file != new_ts_file:
        old_js_file.unlink()

    # 5. Generate Diff
    diff = RepoService.generate_diff(task["original_code"], new_ts_code, task["path"], task["new_path"])

    # 6. Update Task and State
    task["status"] = "in_progress"
    task["migrated_code"] = new_ts_code
    task["diff"] = diff
    task["notes"] = notes
    task["attempts"] = 1
    tasks[current_file] = task

    logs.append(f"[MIGRATE] Successfully written {task['new_path']} ({len(new_ts_code.splitlines())} lines). Proceeding to validation.")

    serialized_snippets = [
        {
            "file_path": s.file_path,
            "symbol_name": s.symbol_name,
            "chunk_type": s.chunk_type,
            "start_line": s.start_line,
            "end_line": s.end_line,
            "score": s.score,
            "source": s.retrieval_source
        }
        for s in retrieved_snippets
    ]

    return {
        "tasks": tasks,
        "proposed_code": new_ts_code,
        "retrieved_context": serialized_snippets,
        "logs": logs,
        "status": "validating_file"
    }
