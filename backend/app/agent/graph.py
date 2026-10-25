"""
LangGraph Workflow Definition for Metamorph.
Wires ingest -> analyze -> plan -> migrate_file -> validate -> (fix <-> validate loop) -> advance -> review -> report.
"""
from __future__ import annotations

import logging
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from app.agent.state import MigrationState
from app.agent.nodes.ingest import ingest_node
from app.agent.nodes.analyze import analyze_node
from app.agent.nodes.plan import plan_node
from app.agent.nodes.migrate_file import migrate_file_node
from app.agent.nodes.validate import validate_node
from app.agent.nodes.fix import fix_node
from app.agent.nodes.advance import advance_node
from app.agent.nodes.review import review_node
from app.agent.nodes.report import report_node

logger = logging.getLogger("metamorph.graph")


def route_after_validate(state: MigrationState) -> str:
    """Decides whether to proceed to next file, retry with fix, or mark failed."""
    current_file = state.get("current_file")
    if not current_file or current_file not in state["tasks"]:
        return "advance"

    task = state["tasks"][current_file]
    errors = state.get("tsc_errors", [])

    if not errors:
        return "advance"
    
    if task["attempts"] >= 3:
        return "advance"
    
    return "fix"


def route_next(state: MigrationState) -> str:
    """Checks if more files remain in the plan or if we move to review."""
    if state.get("current_file") is not None:
        return "migrate_file"
    return "review"


def create_migration_graph():
    """Assembles and compiles the StateGraph."""
    g = StateGraph(MigrationState)

    # Register Nodes
    g.add_node("ingest", ingest_node)
    g.add_node("analyze", analyze_node)
    g.add_node("plan", plan_node)
    g.add_node("migrate_file", migrate_file_node)
    g.add_node("validate", validate_node)
    g.add_node("fix", fix_node)
    g.add_node("advance", advance_node)
    g.add_node("review", review_node)
    g.add_node("report", report_node)

    # Edges
    g.add_edge(START, "ingest")
    g.add_edge("ingest", "analyze")
    g.add_edge("analyze", "plan")
    
    # From plan, start first file migration
    g.add_edge("plan", "migrate_file")
    g.add_edge("migrate_file", "validate")

    # Conditional branching from validation
    g.add_conditional_edges(
        "validate",
        route_after_validate,
        {
            "advance": "advance",
            "fix": "fix"
        }
    )

    # Fix loop back to validate
    g.add_edge("fix", "validate")

    # Conditional branching from advance (either loop back to migrate_file or finish in review)
    g.add_conditional_edges(
        "advance",
        route_next,
        {
            "migrate_file": "migrate_file",
            "review": "review"
        }
    )

    g.add_edge("review", "report")
    g.add_edge("report", END)

    checkpointer = MemorySaver()
    app = g.compile(checkpointer=checkpointer)
    return app


# Pre-compiled application instance
migration_app = create_migration_graph()
