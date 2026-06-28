import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class EmbeddingService:

    @staticmethod
    def embed_query(text: str) -> list[float]:
        """
        Embed the user's question.
        We use retrieval_query (not retrieval_document)
        because this is a search query not a document.
        This distinction improves search accuracy.
        """
        result = genai.embed_content(
            model='models/text-embedding-004',
            content=text,
            task_type='retrieval_query',
        )
        return result['embedding']