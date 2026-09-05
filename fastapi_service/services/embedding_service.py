from google import genai
from core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:

    @staticmethod
    def embed_query(text: str) -> list:
        result = client.models.embed_content(
            model='gemini-embedding-001',
            contents=text,
            config={'output_dimensionality': 768},
        )
        return result.embeddings[0].values