"""
GeminiProvider — uses Google Gemini via the google-genai SDK.

Active when: LLM_PROVIDER=gemini  OR  LLM_LOAD_BALANCE=True (as one of the providers)
"""
from google import genai
from core.config import settings
from .base import BaseProvider
from typing import Optional


class GeminiProvider(BaseProvider):

    def __init__(self):
        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model = "gemini-3.6-flash"

    def generate(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> str:
        prompt = self._build_prompt(question, context, system_prompt, chat_history)
        models_to_try = [self.model, "gemini-3.5-flash", "gemini-2.5-flash"]
        last_error = None

        for m in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=prompt,
                )
                return response.text
            except Exception as e:
                last_error = e
                print(f"[GeminiProvider] Model {m} failed: {e}. Trying fallback...")

        raise last_error
