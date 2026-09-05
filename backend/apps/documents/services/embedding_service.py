from google import genai
from google.genai import types
from django.conf import settings


class EmbeddingService:

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    def embed_document(self, document):
        chunks = document.chunks.filter(embedding=None)
        embedded_count = 0

        for chunk in chunks:
            try:
                result = self.client.models.embed_content(
                    model='gemini-embedding-001',
                    contents=chunk.content,
                    config={'output_dimensionality': 768},
                )
                chunk.embedding = result.embeddings[0].values
                chunk.save(update_fields=['embedding'])
                embedded_count += 1
            except Exception as e:
                print(f"[Embedding] Error on chunk {chunk.chunk_index}: {e}")
                continue

        return embedded_count