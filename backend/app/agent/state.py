"""
LangGraph State Schemas for Metamorph.
Defines FileTask and MigrationState.
"""
from __future__ import annotations

from typing import Dict, List, Literal, Optional, TypedDict
from pydantic import BaseModel, Field


class FileTask(TypedDict):
    path: str                                           # e.g., "src/routes/users.js"
    new_path: str                                       # e.g., "src/routes/users.ts"
    status: Literal["pending", "in_progress", "done", "failed"]
    attempts: int
    last_error: Optional[str]
    original_code: str
    migrated_code: Optional[str]
    diff: Optional[str]
    notes: Optional[str]


class MigrationState(TypedDict, total=False):
    run_id: str
    repo_id: str
    repo_path: str                                      # Read-only original repo copy
    workspace: str                                      # Migrated workspace directory
    dep_graph: Dict[str, List[str]]                     # file -> [files it imports]
    cycles: List[List[str]]                             # Circular dependency clusters
    plan: List[str]                                     # Topologically sorted file migration order
    detailed_steps: List[dict]                          # Metadata for UI graph
    tasks: Dict[str, FileTask]                          # File path -> Task
    current_file: Optional[str]
    retrieved_context: List[dict]                       # RAG retrieved code snippets and signatures
    proposed_code: Optional[str]                        # Proposed TypeScript migration
    compiler_errors: List[dict]                         # Structured compiler error objects
    test_results: Dict                                  # Unit test execution output
    baseline_tests_passed: Optional[bool]
    tsc_errors: List[str]
    test_output: str
    global_attempts: int
    fix_attempts: int                                   # Attempts per current file
    validation_passed: bool
    review_findings: List[dict]
    completed_files: List[str]
    failed_files: List[str]
    status: str
    report: Dict
    logs: List[str]
    approval_granted: bool


# Structured LLM Output Schemas
class FileMigrationOutput(BaseModel):
    new_code: str = Field(description="The complete migrated TypeScript code for the file.")
    new_dependencies: List[str] = Field(
        default_factory=list,
        description="List of any newly required npm packages, e.g. ['@types/express', '@types/node']."
    )
    exported_signatures: List[str] = Field(
        default_factory=list,
        description="TypeScript signatures of exported functions, interfaces, or types to pass downstream."
    )
    notes: str = Field(
        default="",
        description="Brief summary of changes made, types inferred, and CommonJS to ESM conversions."
    )


class FixErrorOutput(BaseModel):
    fixed_code: str = Field(description="The corrected TypeScript code that resolves the compiler or test error.")
    explanation: str = Field(description="Explanation of what caused the error and how it was resolved.")
    additional_packages: List[str] = Field(
        default_factory=list,
        description="Any missing @types packages required to resolve the error."
    )
