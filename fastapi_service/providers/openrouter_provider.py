"""
OpenRouterProvider — uses OpenRouter's OpenAI-compatible API.

OpenRouter gives access to 100+ models via one API key.
We cycle through the configured model list (round-robin) so if one
model is rate-limited or slow, the next one picks up.

Active when: LLM_PROVIDER=openrouter  OR  LLM_LOAD_BALANCE=True

Set in .env:
  OPENROUTER_API_KEY=sk-or-...
  OPENROUTER_MODELS=google/gemini-flash-1.5,mistralai/mixtral-8x7b-instruct

https://openrouter.ai/docs
"""
import threading
import httpx
from core.config import settings
from .base import BaseProvider
from typing import Optional


class OpenRouterProvider(BaseProvider):

    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = settings.OPENROUTER_BASE_URL
        self.models = settings.get_openrouter_models()
        self._lock = threading.Lock()
        self._model_index = 0  # for round-robin

    def _next_model(self) -> str:
        """Thread-safe round-robin model selection."""
        with self._lock:
            model = self.models[self._model_index % len(self.models)]
            self._model_index += 1
            return model

    def generate(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> str:
        if not self.api_key:
            raise ValueError("OPENROUTER_API_KEY is not configured")

        if not self.models:
            raise ValueError("OPENROUTER_MODELS list is empty")

        messages = self._build_messages(question, context, system_prompt, chat_history)

        # Try each model in order; fall back on error
        last_error = None
        for _ in range(len(self.models)):
            model = self._next_model()
            try:
                response = httpx.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://chatsaas.app",  # OpenRouter requires this
                        "X-Title": "ChatSaaS Platform",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "max_tokens": 1024,
                        "temperature": 0.3,
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except Exception as e:
                last_error = e
                continue  # try next model

        raise Exception(f"All OpenRouter models failed. Last error: {last_error}")
