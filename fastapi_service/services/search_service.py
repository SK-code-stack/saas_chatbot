from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


class SearchService:

    @staticmethod
    async def search_chunks(
        db: AsyncSession,
        document_ids: list[int],
        query_embedding: list[float],
        top_k: int = 5
    ) -> list[dict]:
        """
        Find most relevant chunks using cosine similarity.

        The <=> operator is pgvector's cosine distance operator.
        Lower distance = more similar.
        We filter by document_ids so users only search their own docs.
        """

        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'

        query = text("""
            SELECT
                dc.id,
                dc.content,
                dc.chunk_index,
                dc.page_number,
                dc.document_id,
                d.title as document_title,
                1 - (dc.embedding <=> :embedding ::vector) as similarity
            FROM document_chunks dc
            JOIN documents d ON d.id = dc.document_id
            WHERE dc.document_id = ANY(:doc_ids)
              AND dc.embedding IS NOT NULL
            ORDER BY dc.embedding <=> :embedding ::vector
            LIMIT :top_k
        """)

        result = await db.execute(query, {
            'embedding': embedding_str,
            'doc_ids': document_ids,
            'top_k': top_k
        })

        rows = result.fetchall()

        return [
            {
                'id': row.id,
                'content': row.content,
                'chunk_index': row.chunk_index,
                'page_number': row.page_number,
                'document_id': row.document_id,
                'document_title': row.document_title,
                'similarity': float(row.similarity),
            }
            for row in rows
        ]

    @staticmethod
    def build_context(chunks: list[dict]) -> str:
        """
        Combine retrieved chunks into one context string
        that gets passed to Gemini.
        """
        context_parts = []
        for chunk in chunks:
            context_parts.append(
                f"[From: {chunk['document_title']} | Page: {chunk['page_number']}]\n"
                f"{chunk['content']}"
            )
        return '\n\n---\n\n'.join(context_parts)