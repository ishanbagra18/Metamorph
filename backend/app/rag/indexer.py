"""
Qdrant Vector DB Indexer for Metamorph Code Chunks.
Manages collection creation, payload indexing, incremental hash-based upserts,
and repository cleanup.
"""
from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Set

from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

from app.rag.chunker import CodeChunk
from app.rag.embeddings import EmbeddingsProvider

logger = logging.getLogger("metamorph.indexer")

COLLECTION_NAME = "code_chunks"


class QdrantCodeIndexer:
    def __init__(self, storage_path: Optional[str] = None):
        self.storage_path = storage_path or os.getenv("QDRANT_STORAGE_PATH", "./qdrant_data")
        self.embeddings = EmbeddingsProvider()
        self.client = self._init_client()
        self._ensure_collection()

    def _init_client(self) -> QdrantClient:
        # 1. Check if remote Qdrant URL is set
        qdrant_url = os.getenv("QDRANT_URL")
        if qdrant_url:
            try:
                return QdrantClient(url=qdrant_url, api_key=os.getenv("QDRANT_API_KEY"))
            except Exception as e:
                logger.warning(f"Failed to connect to remote Qdrant at {qdrant_url}: {e}")

        # 2. Local on-disk persistence
        try:
            path = Path(self.storage_path).resolve()
            path.mkdir(parents=True, exist_ok=True)
            return QdrantClient(path=str(path))
        except Exception as e:
            logger.warning(f"Local Qdrant path failed ({e}), falling back to in-memory Qdrant instance.")
            return QdrantClient(":memory:")

    def _ensure_collection(self):
        """Creates collection and payload indexes if not already existing."""
        collections = self.client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        
        if not exists:
            self.client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qmodels.VectorParams(
                    size=EmbeddingsProvider.DIMENSION,
                    distance=qmodels.Distance.COSINE
                )
            )
            # Create payload indexes for fast filtering
            for field_name in ["repo_id", "file_path", "symbol_name", "chunk_type", "language"]:
                try:
                    self.client.create_payload_index(
                        collection_name=COLLECTION_NAME,
                        field_name=field_name,
                        field_schema=qmodels.PayloadSchemaType.KEYWORD
                    )
                except Exception:
                    pass

    def get_indexed_hashes(self, repo_id: str) -> Dict[str, str]:
        """Returns map of {chunk_id: content_hash} to enable incremental re-indexing."""
        filter_query = qmodels.Filter(
            must=[qmodels.FieldCondition(key="repo_id", match=qmodels.MatchValue(value=repo_id))]
        )
        try:
            points, _ = self.client.scroll(
                collection_name=COLLECTION_NAME,
                scroll_filter=filter_query,
                limit=1000,
                with_payload=True,
                with_vectors=False
            )
            return {
                p.id: p.payload.get("content_hash", "")
                for p in points if p.payload
            }
        except Exception:
            return {}

    def index_chunks(self, chunks: List[CodeChunk]) -> int:
        """
        Computes embeddings and upserts code chunks with rich metadata into Qdrant.
        Skips unchanged chunks using content hashes.
        """
        if not chunks:
            return 0

        repo_id = chunks[0].repo_id
        existing_hashes = self.get_indexed_hashes(repo_id)
        
        # Prepare batches
        texts_to_embed = []
        chunks_to_upsert: List[CodeChunk] = []

        for chunk in chunks:
            # Deterministic point ID from file_path + symbol_name + repo_id
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{repo_id}:{chunk.file_path}:{chunk.symbol_name}:{chunk.start_line}"))
            
            # Check if chunk already indexed with identical hash
            if existing_hashes.get(point_id) == chunk.content_hash:
                continue

            chunks_to_upsert.append((point_id, chunk))
            texts_to_embed.append(chunk.to_embedding_text())

        if not chunks_to_upsert:
            return 0

        # Generate vectors
        vectors = self.embeddings.embed_texts(texts_to_embed)

        points = []
        for (point_id, chunk), vector in zip(chunks_to_upsert, vectors):
            points.append(qmodels.PointStruct(
                id=point_id,
                vector=vector,
                payload={
                    "repo_id": chunk.repo_id,
                    "file_path": chunk.file_path,
                    "symbol_name": chunk.symbol_name,
                    "chunk_type": chunk.chunk_type,
                    "language": chunk.language,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                    "content": chunk.content,
                    "content_hash": chunk.content_hash,
                    "imports": chunk.imports,
                    "exports": chunk.exports
                }
            ))

        # Upsert in batches of 100
        batch_size = 100
        for i in range(0, len(points), batch_size):
            batch = points[i:i + batch_size]
            self.client.upsert(
                collection_name=COLLECTION_NAME,
                points=batch
            )

        logger.info(f"Indexed {len(points)} chunks into Qdrant collection '{COLLECTION_NAME}' for repo '{repo_id}'")
        return len(points)

    def delete_repo(self, repo_id: str):
        """Removes all indexed chunks for a repository."""
        self.client.delete(
            collection_name=COLLECTION_NAME,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[qmodels.FieldCondition(key="repo_id", match=qmodels.MatchValue(value=repo_id))]
                )
            )
        )
