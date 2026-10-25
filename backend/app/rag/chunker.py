"""
AST-Aware Code Chunker for Metamorph.
Divides JavaScript/TypeScript codebases into semantic units (functions, classes, route handlers, modules)
instead of arbitrary character chunks. Computes content hashes for incremental indexing.
"""
from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from app.analysis.ast_extractor import ASTExtractor, FileAST


@dataclass
class CodeChunk:
    repo_id: str
    file_path: str
    symbol_name: str
    chunk_type: str                  # "function", "class", "route", "module", "export"
    language: str                    # "javascript" | "typescript"
    start_line: int
    end_line: int
    content: str
    content_hash: str
    imports: List[str] = field(default_factory=list)
    exports: List[str] = field(default_factory=list)

    def to_embedding_text(self) -> str:
        """Constructs rich contextual text for vector representation."""
        imports_str = ", ".join(self.imports) if self.imports else "none"
        exports_str = ", ".join(self.exports) if self.exports else "none"
        return (
            f"Repository: {self.repo_id}\n"
            f"File: {self.file_path}\n"
            f"Symbol: {self.symbol_name}\n"
            f"Type: {self.chunk_type}\n"
            f"Language: {self.language}\n"
            f"Imports: {imports_str}\n"
            f"Exports: {exports_str}\n\n"
            f"Source:\n{self.content}"
        )


class CodeChunker:
    def __init__(self):
        self.extractor = ASTExtractor()

    @staticmethod
    def compute_hash(text: str) -> str:
        return hashlib.sha256(text.strip().encode("utf-8")).hexdigest()[:16]

    def chunk_file(self, repo_id: str, file_path: str, code: str, language: str = "javascript") -> List[CodeChunk]:
        """
        Parses source code into structured semantic chunks using AST analysis + block heuristics.
        """
        ast: FileAST = self.extractor.parse(file_path, code)
        chunks: List[CodeChunk] = []
        lines = code.splitlines()
        total_lines = len(lines)

        file_imports = [imp.source for imp in ast.imports]
        file_exports = [exp.name for exp in ast.exports]

        # 1. Chunk Functions & Methods
        # Identify function boundaries using function signatures + brace matching
        visited_ranges: List[tuple[int, int]] = []

        for func in ast.functions:
            start_idx = max(0, func.line - 1)
            # Find the closing brace for this function block
            end_idx = self._find_closing_brace(lines, start_idx)
            if end_idx is None or end_idx <= start_idx:
                end_idx = min(start_idx + 30, total_lines)
            
            chunk_content = "\n".join(lines[start_idx:end_idx])
            if chunk_content.strip():
                chunk = CodeChunk(
                    repo_id=repo_id,
                    file_path=file_path,
                    symbol_name=func.name,
                    chunk_type="function",
                    language=language,
                    start_line=start_idx + 1,
                    end_line=end_idx,
                    content=chunk_content,
                    content_hash=self.compute_hash(chunk_content),
                    imports=file_imports,
                    exports=[func.name] if func.name in file_exports else []
                )
                chunks.append(chunk)
                visited_ranges.append((start_idx, end_idx))

        # 2. Chunk Express Route Handlers (e.g., router.get('/', ...), app.post(...))
        route_pattern = re.compile(r'(?:router|app)\.(get|post|put|delete|patch|use)\s*\(\s*[\'"`]([^\'"`]+)[\'"`]')
        for idx, line in enumerate(lines):
            match = route_pattern.search(line)
            if match:
                method, route_path = match.groups()
                # Check if already encompassed
                if any(start <= idx < end for start, end in visited_ranges):
                    continue
                end_idx = self._find_closing_brace(lines, idx) or min(idx + 25, total_lines)
                chunk_content = "\n".join(lines[idx:end_idx])
                if chunk_content.strip():
                    symbol = f"{method.upper()} {route_path}"
                    chunk = CodeChunk(
                        repo_id=repo_id,
                        file_path=file_path,
                        symbol_name=symbol,
                        chunk_type="route",
                        language=language,
                        start_line=idx + 1,
                        end_line=end_idx,
                        content=chunk_content,
                        content_hash=self.compute_hash(chunk_content),
                        imports=file_imports,
                        exports=[]
                    )
                    chunks.append(chunk)
                    visited_ranges.append((idx, end_idx))

        # 3. Module Header / Declarations / Exports Chunk
        # Includes top-level requires/imports, configurations, and module.exports
        header_lines = []
        for idx, line in enumerate(lines):
            if not any(start <= idx < end for start, end in visited_ranges):
                header_lines.append((idx + 1, line))

        if header_lines:
            content_text = "\n".join(line for _, line in header_lines if line.strip())
            if content_text.strip():
                start_l = header_lines[0][0]
                end_l = header_lines[-1][0]
                chunk = CodeChunk(
                    repo_id=repo_id,
                    file_path=file_path,
                    symbol_name=f"{Path(file_path).stem}_module",
                    chunk_type="module",
                    language=language,
                    start_line=start_l,
                    end_line=end_l,
                    content=content_text,
                    content_hash=self.compute_hash(content_text),
                    imports=file_imports,
                    exports=file_exports
                )
                chunks.append(chunk)

        # Fallback if no specific chunks detected (e.g. small utility file)
        if not chunks:
            chunk = CodeChunk(
                repo_id=repo_id,
                file_path=file_path,
                symbol_name=Path(file_path).stem,
                chunk_type="module",
                language=language,
                start_line=1,
                end_line=total_lines,
                content=code,
                content_hash=self.compute_hash(code),
                imports=file_imports,
                exports=file_exports
            )
            chunks.append(chunk)

        return chunks

    def _find_closing_brace(self, lines: List[str], start_line_idx: int) -> Optional[int]:
        brace_count = 0
        found_open = False
        for i in range(start_line_idx, len(lines)):
            line = lines[i]
            for char in line:
                if char == '{':
                    brace_count += 1
                    found_open = True
                elif char == '}':
                    brace_count -= 1
                    if found_open and brace_count == 0:
                        return i + 1
        return None
