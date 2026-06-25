import google.generativeai as genai
from django.conf import settings
from ..models import DocumentChunk


class EmbeddingService:

    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)

    def embed_document(self, document):
        """
        Generate embeddings for all chunks of a document.
        Gemini embedding model returns 768-dimension vectors.
        We save each vector to the chunk's embedding field.
        """
        chunks = DocumentChunk.objects.filter(
            document=document,
            embedding=None
        )

        embedded_count = 0

        for chunk in chunks:
            try:
                result = genai.embed_content(
                    model='models/text-embedding-004',
                    content=chunk.content,
                    task_type='retrieval_document',
                )
                chunk.embedding = result['embedding']
                chunk.save(update_fields=['embedding'])
                embedded_count += 1

            except Exception as e:
                print(f"[Embedding] Error on chunk {chunk.chunk_index}: {e}")
                continue

        return embedded_count