"""
Dependency Graph Builder for Node/Express Projects.
Features:
- Relative path resolution (e.g. './routes' -> 'routes.js' or 'routes/index.js')
- Detection of external npm modules for @types/* installation
- Upstream type signatures cache for LLM context
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Dict, List, Set, Tuple

from .ast_extractor import ASTExtractor, FileAST


IGNORED_DIRS = {
    "node_modules", ".git", "dist", "build", "coverage", ".next", ".cache", "test-results"
}

VALID_EXTENSIONS = [".js", ".mjs", ".cjs"]


class DependencyGraphBuilder:
    def __init__(self, root_dir: str):
        self.root_dir = Path(root_dir).resolve()
        self.extractor = ASTExtractor()
        self.file_asts: Dict[str, FileAST] = {}
        self.external_packages: Set[str] = set()
        self.dep_graph: Dict[str, List[str]] = {}  # file_path -> list of files it imports

    def scan_repo(self) -> List[str]:
        """Finds all eligible JS files in the repository."""
        js_files = []
        for root, dirs, files in os.walk(self.root_dir):
            # Prune ignored directories
            dirs[:] = [d for d in dirs if d not in IGNORED_DIRS and not d.startswith(".")]
            
            for file in files:
                if any(file.endswith(ext) for ext in VALID_EXTENSIONS):
                    full_path = Path(root) / file
                    rel_path = full_path.relative_to(self.root_dir).as_posix()
                    js_files.append(rel_path)
        return sorted(js_files)

    def build_graph(self) -> Tuple[Dict[str, List[str]], Dict[str, FileAST], Set[str]]:
        """
        Parses all files, resolves imports, and constructs the dependency DAG.
        Returns:
            dep_graph: { 'app.js': ['routes/users.js', 'middleware/auth.js'] }
            file_asts: { 'app.js': FileAST(...) }
            external_packages: { 'express', 'cors', 'jsonwebtoken' }
        """
        files = self.scan_repo()
        self.dep_graph = {f: [] for f in files}

        # 1. Parse each file
        for rel_path in files:
            full_path = self.root_dir / rel_path
            try:
                code = full_path.read_text(encoding="utf-8", errors="replace")
                ast = self.extractor.parse(rel_path, code)
                self.file_asts[rel_path] = ast
            except Exception as e:
                # Log and proceed with empty AST
                self.file_asts[rel_path] = FileAST(file_path=rel_path, raw_code="")

        # 2. Resolve import paths
        for rel_path, ast in self.file_asts.items():
            current_file_dir = (self.root_dir / rel_path).parent

            for imp in ast.imports:
                source = imp.source.strip()
                if not source or imp.is_dynamic or source == "__dynamic__":
                    continue

                if source.startswith("."):
                    # Relative import
                    resolved = self._resolve_relative_path(current_file_dir, source)
                    if resolved and resolved in self.dep_graph:
                        if resolved not in self.dep_graph[rel_path]:
                            self.dep_graph[rel_path].append(resolved)
                else:
                    # External module, e.g. "express", "@prisma/client"
                    # Capture root package name
                    parts = source.split("/")
                    pkg_name = f"{parts[0]}/{parts[1]}" if source.startswith("@") and len(parts) > 1 else parts[0]
                    self.external_packages.add(pkg_name)

        return self.dep_graph, self.file_asts, self.external_packages

    def _resolve_relative_path(self, current_dir: Path, source: str) -> str | None:
        """
        Resolves Node.js module paths:
        ./foo -> ./foo.js, ./foo.mjs, ./foo.cjs, ./foo/index.js
        """
        target_path = (current_dir / source).resolve()

        # Direct file match with extension
        if target_path.is_file():
            try:
                return target_path.relative_to(self.root_dir).as_posix()
            except ValueError:
                return None

        # Try appending extensions
        for ext in VALID_EXTENSIONS + [".ts", ".tsx", ".json"]:
            candidate = target_path.with_suffix(ext)
            if candidate.is_file():
                try:
                    return candidate.relative_to(self.root_dir).as_posix()
                except ValueError:
                    return None

        # Try index file inside directory
        if target_path.is_dir():
            for ext in VALID_EXTENSIONS + [".ts"]:
                candidate = target_path / f"index{ext}"
                if candidate.is_file():
                    try:
                        return candidate.relative_to(self.root_dir).as_posix()
                    except ValueError:
                        return None

        return None
