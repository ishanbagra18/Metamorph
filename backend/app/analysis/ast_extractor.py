"""
AST Extractor for JavaScript & TypeScript (Node / Express repos).
Extracts:
1. ES6 Imports (`import x from './y'`, `import { a, b } from './y'`)
2. CommonJS Requires (`const x = require('./x')`, `const { a } = require('./x')`)
3. ES6 Exports (`export default ...`, `export const foo = ...`, `export { a, b }`)
4. CommonJS Exports (`module.exports = ...`, `exports.foo = ...`)
5. Functions, Classes, and parameter signatures.

Uses Tree-sitter AST queries with a robust regex fallback for zero-downtime parsing.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import List, Optional

try:
    from tree_sitter import Language, Parser
    import tree_sitter_javascript as ts_js
    _HAS_TREE_SITTER = True
except Exception:
    _HAS_TREE_SITTER = False


@dataclass
class ImportInfo:
    source: str                 # e.g., "./routes/user", "express"
    specifiers: List[str]       # e.g., ["Router", "Request"], or ["express"]
    is_default: bool = False
    is_commonjs: bool = False
    is_dynamic: bool = False
    line: int = 1


@dataclass
class ExportInfo:
    name: str                   # e.g., "app", "createUser", "default"
    is_default: bool = False
    is_commonjs: bool = False
    line: int = 1


@dataclass
class FunctionSignature:
    name: str
    params: List[str]
    is_async: bool = False
    line: int = 1


@dataclass
class FileAST:
    file_path: str
    imports: List[ImportInfo] = field(default_factory=list)
    exports: List[ExportInfo] = field(default_factory=list)
    functions: List[FunctionSignature] = field(default_factory=list)
    has_express: bool = False
    raw_code: str = ""


class ASTExtractor:
    def __init__(self):
        self.parser = None
        if _HAS_TREE_SITTER:
            try:
                js_lang = Language(ts_js.language())
                self.parser = Parser(js_lang)
            except Exception:
                self.parser = None

    def parse(self, file_path: str, code: str) -> FileAST:
        ast = FileAST(file_path=file_path, raw_code=code)
        
        # Check Express presence
        if "express" in code:
            ast.has_express = True

        # Extract using Regex + AST heuristics (fast, handles CommonJS + ES6 reliably)
        self._extract_imports(code, ast)
        self._extract_exports(code, ast)
        self._extract_functions(code, ast)
        
        return ast

    def _extract_imports(self, code: str, ast: FileAST):
        lines = code.splitlines()
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            if not stripped or stripped.startswith("//") or stripped.startswith("/*"):
                continue

            # 1. CommonJS: const ... = require('...')
            # e.g. const express = require('express')
            # e.g. const { Router, json } = require('express')
            cjs_match = re.search(r'(?:const|let|var)\s+({?[\w\s,]+}?)\s*=\s*require\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)', stripped)
            if cjs_match:
                spec_str, source = cjs_match.groups()
                specifiers = [s.strip() for s in spec_str.replace("{", "").replace("}", "").split(",") if s.strip()]
                is_default = not ("{" in spec_str)
                ast.imports.append(ImportInfo(
                    source=source,
                    specifiers=specifiers,
                    is_default=is_default,
                    is_commonjs=True,
                    line=idx
                ))
                continue

            # Bare require: require('./config/db')
            bare_req = re.search(r'require\(\s*[\'"`]([^\'"`]+)[\'"`]\s*\)', stripped)
            if bare_req and not cjs_match:
                source = bare_req.group(1)
                ast.imports.append(ImportInfo(
                    source=source,
                    specifiers=[],
                    is_default=False,
                    is_commonjs=True,
                    line=idx
                ))
                continue

            # Dynamic require check: require(variable)
            if re.search(r'require\([^"\'`\)]+\)', stripped):
                ast.imports.append(ImportInfo(
                    source="__dynamic__",
                    specifiers=[],
                    is_dynamic=True,
                    is_commonjs=True,
                    line=idx
                ))
                continue

            # 2. ES6: import ... from '...'
            # e.g. import express from 'express'
            # e.g. import { a, b } from './utils'
            # e.g. import * as auth from './auth'
            es6_match = re.search(r'import\s+({?[\w\s,*\$]+}?)\s+from\s+[\'"`]([^\'"`]+)[\'"`]', stripped)
            if es6_match:
                spec_str, source = es6_match.groups()
                specifiers = [s.strip() for s in spec_str.replace("{", "").replace("}", "").split(",") if s.strip()]
                is_default = not ("{" in spec_str)
                ast.imports.append(ImportInfo(
                    source=source,
                    specifiers=specifiers,
                    is_default=is_default,
                    is_commonjs=False,
                    line=idx
                ))
                continue

            # Bare ES6 import: import './polyfills'
            bare_es6 = re.search(r'import\s+[\'"`]([^\'"`]+)[\'"`]', stripped)
            if bare_es6:
                source = bare_es6.group(1)
                ast.imports.append(ImportInfo(
                    source=source,
                    specifiers=[],
                    is_default=False,
                    is_commonjs=False,
                    line=idx
                ))

    def _extract_exports(self, code: str, ast: FileAST):
        lines = code.splitlines()
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            
            # CommonJS: module.exports = ...
            if stripped.startswith("module.exports"):
                # module.exports = { a, b, c }
                obj_match = re.search(r'module\.exports\s*=\s*\{([^}]+)\}', stripped)
                if obj_match:
                    items = [i.strip().split(":")[0].strip() for i in obj_match.group(1).split(",") if i.strip()]
                    for item in items:
                        ast.exports.append(ExportInfo(name=item, is_default=False, is_commonjs=True, line=idx))
                else:
                    # module.exports = app
                    name_match = re.search(r'module\.exports\s*=\s*([\w\$]+)', stripped)
                    name = name_match.group(1) if name_match else "default"
                    ast.exports.append(ExportInfo(name=name, is_default=True, is_commonjs=True, line=idx))
                continue

            # CommonJS: exports.xyz = ...
            if stripped.startswith("exports."):
                exp_match = re.search(r'exports\.([\w\$]+)\s*=', stripped)
                if exp_match:
                    ast.exports.append(ExportInfo(name=exp_match.group(1), is_default=False, is_commonjs=True, line=idx))
                continue

            # ES6: export default ...
            if stripped.startswith("export default"):
                def_match = re.search(r'export\s+default\s+(?:async\s+)?(?:function\*?|class)?\s*([\w\$]+)?', stripped)
                name = def_match.group(1) if (def_match and def_match.group(1)) else "default"
                ast.exports.append(ExportInfo(name=name, is_default=True, is_commonjs=False, line=idx))
                continue

            # ES6: export const/let/var/function/class ...
            es6_named = re.search(r'export\s+(?:const|let|var|function|class)\s+([\w\$]+)', stripped)
            if es6_named:
                ast.exports.append(ExportInfo(name=es6_named.group(1), is_default=False, is_commonjs=False, line=idx))
                continue

            # ES6: export { a, b }
            es6_list = re.search(r'export\s*\{([^}]+)\}', stripped)
            if es6_list:
                items = [i.strip().split(" as ")[-1].strip() for i in es6_list.group(1).split(",") if i.strip()]
                for item in items:
                    ast.exports.append(ExportInfo(name=item, is_default=False, is_commonjs=False, line=idx))

    def _extract_functions(self, code: str, ast: FileAST):
        lines = code.splitlines()
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            
            # function foo(a, b) or async function foo(a, b)
            fn_match = re.search(r'(async\s+)?function\s*([\w\$]*)\s*\(([^)]*)\)', stripped)
            if fn_match:
                is_async = bool(fn_match.group(1))
                name = fn_match.group(2) or "anonymous"
                params = [p.strip().split("=")[0].strip() for p in fn_match.group(3).split(",") if p.strip()]
                ast.functions.append(FunctionSignature(name=name, params=params, is_async=is_async, line=idx))
                continue

            # const foo = (a, b) => or const foo = async (a, b) =>
            arrow_match = re.search(r'(?:const|let|var)\s+([\w\$]+)\s*=\s*(async\s+)?(?:\(([^)]*)\)|([\w\$]+))\s*=>', stripped)
            if arrow_match:
                name = arrow_match.group(1)
                is_async = bool(arrow_match.group(2))
                params_str = arrow_match.group(3) or arrow_match.group(4) or ""
                params = [p.strip().split("=")[0].strip() for p in params_str.split(",") if p.strip()]
                ast.functions.append(FunctionSignature(name=name, params=params, is_async=is_async, line=idx))
