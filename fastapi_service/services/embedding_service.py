from google import genai
from core.config import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:

    @staticmethod
    def embed_query(text: str) -> list:
        result = client.models.embed_content(
            model='text-embedding-004',
            contents=text,
        )
        return result.embeddings[0].values