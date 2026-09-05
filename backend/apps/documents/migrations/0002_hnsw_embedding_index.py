"""
Migration: Add HNSW vector index on document_chunks.embedding

Why HNSW over IVFFlat?
- HNSW (Hierarchical Navigable Small World) gives faster query speed
  with better recall accuracy.
- IVFFlat requires a training step (needs data already in table).
- HNSW builds incrementally — works even on an empty table.

Index parameters:
- m=16        → number of bi-directional links per node (higher = better recall, more memory)
- ef_construction=64 → search width during index build (higher = better quality, slower build)

Op class:
- vector_cosine_ops → matches the <=> cosine distance operator used in search queries
"""

from django.db import migrations


class Migration(migrations.Migration):

    # CONCURRENTLY cannot run inside a transaction block.
    # Setting atomic=False tells Django not to wrap this migration in one.
    atomic = False

    dependencies = [
        ('documents', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                CREATE INDEX CONCURRENTLY IF NOT EXISTS document_chunks_embedding_hnsw_idx
                ON document_chunks
                USING hnsw (embedding vector_cosine_ops)
                WITH (m = 16, ef_construction = 64);
            """,
            reverse_sql="""
                DROP INDEX IF EXISTS document_chunks_embedding_hnsw_idx;
            """,
        ),
    ]
