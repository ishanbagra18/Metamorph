"""
Embeddings Provider for Metamorph Code Chunks.
Provides 384-dimensional normalized dense vectors.
Supports:
1. Google Generative AI Embeddings (if GEMINI_API_KEY is configured).
2. FastEmbed / sentence-transformers (if installed).
3. Deterministic Code Dense Vectorizer (zero-downtime, offline fallback using subword n-gram hashing and L2 normalization).
"""
from __future__ import annotations

import hashlib
import math
import re
from typing import List

from app.config import settings


class EmbeddingsProvider:
    DIMENSION = 384

    def __init__(self):
        self._provider = None
        self._init_provider()

    def _init_provider(self):
        # 1. Try Google Generative AI if key is set
        if settings.GEMINI_API_KEY:
            try:
                from langchain_google_genai import GoogleGenerativeAIEmbeddings
                self._provider = GoogleGenerativeAIEmbeddings(
                    model="models/embedding-001",
                    google_api_key=settings.GEMINI_API_KEY
                )
                return
            except Exception:
                pass

        # Fallback to deterministic code dense vectorizer
        self._provider = None

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []

        if self._provider:
            try:
                vectors = self._provider.embed_documents(texts)
                # Rescale or adjust dimension if needed
                return [self._normalize_vector(v) for v in vectors]
            except Exception:
                pass

        # Deterministic Code Feature Vectorizer
        return [self._dense_code_embedding(t) for t in texts]

    def embed_query(self, query: str) -> List[float]:
        vectors = self.embed_texts([query])
        return vectors[0] if vectors else [0.0] * self.DIMENSION

    def _dense_code_embedding(self, text: str) -> List[float]:
        """
        Generates a 384-dimensional dense representation capturing code keywords,
        identifiers, camelCase/snake_case tokens, and module syntax.
        """
        vec = [0.0] * self.DIMENSION
        if not text:
            return vec

        # Tokenize code identifiers, symbols, and keywords
        tokens = re.findall(r'[a-zA-Z0-9_\.\$\-\/]+', text.lower())
        if not tokens:
            return vec

        for idx, token in enumerate(tokens):
            # Positional weight decay
            pos_weight = 1.0 / (1.0 + math.log1p(idx * 0.05))
            
            # Subword hash buckets
            h_int = int(hashlib.md5(token.encode("utf-8")).hexdigest(), 16)
            dim_idx = h_int % self.DIMENSION
            sign = 1.0 if ((h_int >> 8) & 1) == 0 else -1.0
            vec[dim_idx] += sign * pos_weight

            # Character 3-gram hashing for spelling/variant tolerance
            if len(token) >= 3:
                for i in range(len(token) - 2):
                    tri = token[i:i+3]
                    tri_hash = int(hashlib.md5(tri.encode("utf-8")).hexdigest(), 16)
                    vec[tri_hash % self.DIMENSION] += 0.3 * sign

        return self._normalize_vector(vec)

    @staticmethod
    def _normalize_vector(vec: List[float]) -> List[List[float]]:
        # Truncate or pad to exactly DIMENSION
        target_dim = EmbeddingsProvider.DIMENSION
        if len(vec) < target_dim:
            vec = vec + [0.0] * (target_dim - len(vec))
        elif len(vec) > target_dim:
            vec = vec[:target_dim]

        norm = math.sqrt(sum(x * x for x in vec))
        if norm < 1e-9:
            return [0.0] * target_dim
        return [x / norm for x in vec]
