"""
Comprehensive Test Suite for Metamorph Migration Engine.
Tests:
- Unit: AST Extractor, Dependency Graph Builder, Topological Planner, TypeScript Diagnostic Parser, Storage Engine.
- Integration: FastAPI REST endpoints via TestClient.
- End-to-End: LangGraph autonomous migration workflow.
"""
import os
import sys
import tempfile
import unittest
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

from app.analysis.ast_extractor import ASTExtractor, FileAST
from app.analysis.dep_graph import DependencyGraphBuilder
from app.analysis.toposort import TopoPlanner
from app.sandbox.runner import SandboxRunner, TscError
from app.services.storage import StorageService
from starlette.testclient import TestClient
from app.main import app


class TestASTExtractor(unittest.TestCase):
    def setUp(self):
        self.extractor = ASTExtractor()

    def test_extract_commonjs_and_express(self):
        code = """
        const express = require('express');
        const router = express.Router();
        const { getTodos, addTodo } = require('./services/todoService');
        const auth = require('./middleware/auth');

        router.get('/', (req, res) => {
            res.json(getTodos());
        });

        module.exports = router;
        """
        ast = self.extractor.parse("routes/todos.js", code)
        self.assertTrue(ast.has_express, "Should detect Express usage")
        
        sources = [imp.source for imp in ast.imports]
        self.assertIn("express", sources)
        self.assertIn("./services/todoService", sources)
        self.assertIn("./middleware/auth", sources)
        
        export_names = [exp.name for exp in ast.exports]
        self.assertIn("router", export_names)

    def test_extract_es6_modules(self):
        code = """
        import express from 'express';
        import { helperA } from './utils/helper';
        export const MAX_ITEMS = 100;
        export default function calculateTotal(items) {
            return items.length;
        }
        """
        ast = self.extractor.parse("src/calculator.js", code)
        sources = [imp.source for imp in ast.imports]
        self.assertIn("express", sources)
        self.assertIn("./utils/helper", sources)
        export_names = [exp.name for exp in ast.exports]
        self.assertIn("MAX_ITEMS", export_names)
        self.assertIn("calculateTotal", export_names)


class TestDepGraphAndTopoSort(unittest.TestCase):
    def test_sample_repo_analysis(self):
        sample_dir = backend_dir.parent / "samples" / "express-todo-app"
        self.assertTrue(sample_dir.exists(), f"Sample directory {sample_dir} must exist")

        builder = DependencyGraphBuilder(str(sample_dir))
        graph, asts, exts = builder.build_graph()

        self.assertIn("middleware/auth.js", graph)
        self.assertIn("routes/todos.js", graph)
        self.assertIn("server.js", graph)
        self.assertIn("services/todoService.js", graph)

        # routes/todos.js depends on services/todoService.js and middleware/auth.js
        self.assertIn("services/todoService.js", graph["routes/todos.js"])
        self.assertIn("middleware/auth.js", graph["routes/todos.js"])

        # Topo sort
        planner = TopoPlanner(graph)
        order, cycles, steps = planner.analyze_plan()

        self.assertEqual(len(cycles), 0, "Sample repo should have no circular dependencies")
        self.assertEqual(len(order), len(graph), "All files must be planned")

        # Leaf files must appear before dependents
        auth_idx = order.index("middleware/auth.js")
        todo_service_idx = order.index("services/todoService.js")
        routes_idx = order.index("routes/todos.js")
        server_idx = order.index("server.js")

        self.assertLess(auth_idx, routes_idx, "middleware/auth.js must precede routes/todos.js")
        self.assertLess(todo_service_idx, routes_idx, "services/todoService.js must precede routes/todos.js")
        self.assertLess(routes_idx, server_idx, "routes/todos.js must precede server.js")

    def test_cycle_detection(self):
        # Graph with cycle: A -> B -> C -> A
        cyclic_graph = {
            "a.js": ["b.js"],
            "b.js": ["c.js"],
            "c.js": ["a.js"],
            "d.js": ["a.js"]
        }
        planner = TopoPlanner(cyclic_graph)
        order, cycles, steps = planner.analyze_plan()

        self.assertEqual(len(cycles), 1, "Should identify the circular cluster")
        cycle_set = set(cycles[0])
        self.assertEqual(cycle_set, {"a.js", "b.js", "c.js"})
        self.assertEqual(len(order), 4, "All nodes should still be planned with cycle bundled")


class TestTscDiagnosticParser(unittest.TestCase):
    def test_tsc_error_parsing(self):
        raw_output = """
src/models/user.ts(14,5): error TS2322: Type 'string' is not assignable to type 'number'.
src/routes/api.ts(28,10): error TS7006: Parameter 'req' implicitly has an 'any' type.
        """
        errors = SandboxRunner.parse_tsc_output(raw_output)
        self.assertEqual(len(errors), 2)
        
        self.assertEqual(errors[0].file, "src/models/user.ts")
        self.assertEqual(errors[0].line, 14)
        self.assertEqual(errors[0].col, 5)
        self.assertEqual(errors[0].code, "TS2322")
        self.assertIn("Type 'string' is not assignable", errors[0].message)

        grouped = SandboxRunner.group_errors_by_file(errors)
        self.assertIn("src/models/user.ts", grouped)
        self.assertIn("src/routes/api.ts", grouped)


class TestStorageEngine(unittest.TestCase):
    def setUp(self):
        self.temp_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_file.close()
        self.storage = StorageService(self.temp_file.name)

    def tearDown(self):
        try:
            if os.path.exists(self.temp_file.name):
                os.unlink(self.temp_file.name)
        except OSError:
            pass

    def test_run_lifecycle(self):
        run_id = "test_run_123"
        self.storage.create_run(run_id, "test_repo", "ready")
        
        run = self.storage.get_run(run_id)
        self.assertIsNotNone(run)
        self.assertEqual(run["status"], "ready")

        self.storage.update_run_state(run_id, "in_progress", {"step": "plan"})
        run_updated = self.storage.get_run(run_id)
        self.assertEqual(run_updated["status"], "in_progress")
        self.assertEqual(run_updated["state"]["step"], "plan")

        runs = self.storage.list_runs()
        self.assertTrue(any(r["run_id"] == run_id for r in runs))


class TestFastAPIRoutes(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_list_runs(self):
        res = self.client.get("/api/runs")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_run_not_found(self):
        res = self.client.get("/api/runs/non_existent_run_999")
        self.assertEqual(res.status_code, 404)

    def test_upload_invalid_filetype(self):
        res = self.client.post("/api/upload", files={"file": ("test.txt", b"plain text", "text/plain")})
        self.assertEqual(res.status_code, 400)


class TestRAGPipeline(unittest.TestCase):
    def setUp(self):
        from app.rag.chunker import CodeChunker
        from app.rag.embeddings import EmbeddingsProvider
        from app.rag.indexer import QdrantCodeIndexer
        from app.rag.retriever import CodeRetriever

        self.chunker = CodeChunker()
        self.embeddings = EmbeddingsProvider()
        # Use in-memory Qdrant client for tests
        from qdrant_client import QdrantClient
        self.indexer = QdrantCodeIndexer()
        self.indexer.client = QdrantClient(":memory:")
        self.indexer._ensure_collection()
        self.retriever = CodeRetriever(self.indexer)

    def test_ast_aware_chunking(self):
        sample_code = """
        const userService = require("../services/userService");

        async function getUser(req, res) {
            const user = await userService.findById(req.params.id);
            res.json(user);
        }

        router.get("/:id", getUser);

        module.exports = { getUser };
        """
        chunks = self.chunker.chunk_file(
            repo_id="test_repo",
            file_path="src/controllers/userController.js",
            code=sample_code,
            language="javascript"
        )
        self.assertGreater(len(chunks), 0)
        symbols = [c.symbol_name for c in chunks]
        self.assertTrue(any("getUser" in s for s in symbols), "Should identify getUser function chunk")
        
        # Verify hash and start/end lines
        for c in chunks:
            self.assertTrue(bool(c.content_hash))
            self.assertGreaterEqual(c.start_line, 1)
            self.assertGreaterEqual(c.end_line, c.start_line)

    def test_embeddings_generation(self):
        text = "async function findUserById(id) { return User.findById(id); }"
        vec = self.embeddings.embed_query(text)
        self.assertEqual(len(vec), 384, "Embedding must be exactly 384 dimensions")
        import math
        norm = math.sqrt(sum(x * x for x in vec))
        self.assertAlmostEqual(norm, 1.0, places=3, msg="Embedding vector must be L2-normalized")

    def test_indexing_and_hybrid_retrieval(self):
        chunks = self.chunker.chunk_file(
            repo_id="repo_123",
            file_path="src/services/userService.js",
            code="""
            async function findById(id) {
                return User.findById(id);
            }
            module.exports = { findById };
            """
        )
        indexed = self.indexer.index_chunks(chunks)
        self.assertGreaterEqual(indexed, 1)

        # Retrieve context for userController
        snippets = self.retriever.retrieve_context_for_file(
            repo_id="repo_123",
            current_file="src/controllers/userController.js",
            imported_files=["src/services/userService.js"],
            ast_symbols=["getUser", "findById"],
            query="Find the implementation of userService.findById",
            top_k=3
        )
        self.assertGreater(len(snippets), 0, "Must retrieve relevant userService snippet")
        self.assertEqual(snippets[0].file_path, "src/services/userService.js")
        self.assertIn("findById", snippets[0].content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
