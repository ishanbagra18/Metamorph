"""
Context Retriever for Metamorph Migration Agent.
Performs hybrid retrieval:
1. Exact Symbol / Dependency Matching (boosted for precise identifier search)
2. Semantic Vector Search via Qdrant (for related functions, interfaces, typing patterns)
3. Upstream Migrated TypeScript Signatures integration.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Dict, List, Optional, Set

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.rag.embeddings import EmbeddingsProvider
from app.rag.indexer import COLLECTION_NAME, QdrantCodeIndexer

logger = logging.getLogger("metamorph.retriever")


@dataclass
class RetrievedSnippet:
    file_path: str
    symbol_name: str
    chunk_type: str
    start_line: int
    end_line: int
    content: str
    score: float
    retrieval_source: str  # "exact_symbol" | "semantic_vector" | "upstream_type"


class CodeRetriever:
    def __init__(self, indexer: Optional[QdrantCodeIndexer] = None):
        self.indexer = indexer or QdrantCodeIndexer()
        self.client: QdrantClient = self.indexer.client
        self.embeddings = self.indexer.embeddings

    def retrieve_context_for_file(
        self,
        repo_id: str,
        current_file: str,
        imported_files: List[str],
        ast_symbols: List[str],
        query: Optional[str] = None,
        top_k: int = 5
    ) -> List[RetrievedSnippet]:
        """
        Retrieves relevant context snippets using hybrid search:
        - Exact matches for imported files & symbols
        - Semantic search for query/interface patterns
        """
        results: Dict[str, RetrievedSnippet] = {}

        # 1. Exact Symbol & Imported File Matching
        for imp in imported_files:
            # Query chunks where file_path matches or is related to dependency
            imp_clean = imp.replace("\\", "/").lstrip("./")
            must_conditions = [
                qmodels.FieldCondition(key="repo_id", match=qmodels.MatchValue(value=repo_id)),
            ]
            
            try:
                # Scroll matching points
                points, _ = self.client.scroll(
                    collection_name=COLLECTION_NAME,
                    scroll_filter=qmodels.Filter(must=must_conditions),
                    limit=50,
                    with_payload=True
                )
                for p in points:
                    payload = p.payload or {}
                    p_file = payload.get("file_path", "").replace("\\", "/")
                    p_symbol = payload.get("symbol_name", "")
                    
                    # Match if in imported file or matches an extracted symbol
                    if imp_clean in p_file or p_symbol in ast_symbols:
                        key = f"{p_file}:{p_symbol}:{payload.get('start_line', 0)}"
                        if key not in results and p_file != current_file:
                            results[key] = RetrievedSnippet(
                                file_path=p_file,
                                symbol_name=p_symbol,
                                chunk_type=payload.get("chunk_type", "function"),
                                start_line=payload.get("start_line", 1),
                                end_line=payload.get("end_line", 1),
                                content=payload.get("content", ""),
                                score=1.5,  # High boost for exact dependency matches
                                retrieval_source="exact_symbol"
                            )
            except Exception as e:
                logger.warning(f"Exact match lookup failed: {e}")

        # 2. Semantic Vector Search via Qdrant
        search_query = query or (
            f"Functions, interfaces, types, and database queries related to {current_file} "
            f"and imported symbols: {', '.join(ast_symbols[:10])}"
        )
        query_vector = self.embeddings.embed_query(search_query)

        try:
            q_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(key="repo_id", match=qmodels.MatchValue(value=repo_id)),
                ],
                must_not=[
                    qmodels.FieldCondition(key="file_path", match=qmodels.MatchValue(value=current_file))
                ]
            )
            if hasattr(self.client, "query_points"):
                response = self.client.query_points(
                    collection_name=COLLECTION_NAME,
                    query=query_vector,
                    query_filter=q_filter,
                    limit=top_k * 2
                )
                vector_hits = response.points
            else:
                vector_hits = self.client.search(
                    collection_name=COLLECTION_NAME,
                    query_vector=query_vector,
                    query_filter=q_filter,
                    limit=top_k * 2
                )

            for hit in vector_hits:
                payload = hit.payload or {}
                p_file = payload.get("file_path", "")
                p_symbol = payload.get("symbol_name", "")
                key = f"{p_file}:{p_symbol}:{payload.get('start_line', 0)}"
                
                if key not in results:
                    results[key] = RetrievedSnippet(
                        file_path=p_file,
                        symbol_name=p_symbol,
                        chunk_type=payload.get("chunk_type", "function"),
                        start_line=payload.get("start_line", 1),
                        end_line=payload.get("end_line", 1),
                        content=payload.get("content", ""),
                        score=float(hit.score),
                        retrieval_source="semantic_vector"
                    )
        except Exception as e:
            logger.warning(f"Vector search failed: {e}")

        # Sort by score descending and take top_k
        sorted_snippets = sorted(results.values(), key=lambda s: s.score, reverse=True)
        return sorted_snippets[:top_k]

    def format_context_for_prompt(self, snippets: List[RetrievedSnippet]) -> str:
        """Formats retrieved snippets into clean context for LLM prompt."""
        if not snippets:
            return "No additional external repository context retrieved."

        formatted_blocks = []
        for s in snippets:
            formatted_blocks.append(
                f"// --- [RAG Context: {s.file_path} -> {s.symbol_name} ({s.chunk_type}, lines {s.start_line}-{s.end_line})] ---\n"
                f"{s.content}"
            )
        return "\n\n".join(formatted_blocks)
