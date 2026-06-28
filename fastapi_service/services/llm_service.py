import google.generativeai as genai
from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)


class LLMService:

    @staticmethod
    def generate_response(
        question: str,
        context: str,
        system_prompt: str = None,
        chat_history: list[dict] = None
    ) -> str:
        """
        Generate answer using Gemini with RAG context.

        system_prompt → set by the business user to control bot personality
        chat_history  → previous messages for multi-turn conversation
        context       → relevant chunks retrieved from vector search
        """

        default_system = (
            "You are a helpful assistant. Answer questions based ONLY on the "
            "provided context. If the answer is not in the context, say "
            "'I don't have enough information to answer that.' "
            "Be concise and professional."
        )

        final_system = system_prompt if system_prompt else default_system

        # Build the full prompt
        prompt = f"""SYSTEM INSTRUCTIONS:
{final_system}

CONTEXT FROM DOCUMENTS:
{context}

"""
        # Add chat history for multi-turn conversation
        if chat_history:
            prompt += "PREVIOUS CONVERSATION:\n"
            for msg in chat_history[-6:]:  # last 6 messages only
                role = "User" if msg['role'] == 'user' else "Assistant"
                prompt += f"{role}: {msg['content']}\n"
            prompt += "\n"

        prompt += f"USER QUESTION:\n{question}\n\nANSWER:"

        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        return response.text