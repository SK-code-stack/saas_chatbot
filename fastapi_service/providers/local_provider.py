"""
LocalProvider — calls a locally running LLM via Ollama-compatible API.

This is a READY-TO-USE stub for when you want to run inference locally
(no internet, no API costs, full data privacy).

Compatible with:
  - Ollama          → https://ollama.ai  (easiest setup)
  - llama.cpp       → with --server flag
  - LM Studio       → local UI with API server
  - any OpenAI-compatible local endpoint

Setup (Ollama example):
  1. Install Ollama: https://ollama.ai
  2. Pull a model: ollama pull llama3
  3. It runs at http://localhost:11434 by default
  4. Set in .env:
       LLM_PROVIDER=local
       LOCAL_LLM_URL=http://localhost:11434
       LOCAL_LLM_MODEL=llama3

Active when: LLM_PROVIDER=local
"""
import httpx
from core.config import settings
from .base import BaseProvider
from typing import Optional


class LocalProvider(BaseProvider):

    def __init__(self):
        self.base_url = settings.LOCAL_LLM_URL
        self.model = settings.LOCAL_LLM_MODEL

    def generate(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> str:
        messages = self._build_messages(question, context, system_prompt, chat_history)

        # Ollama uses /api/chat with OpenAI-style messages
        response = httpx.post(
            f"{self.base_url}/api/chat",
            json={
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 1024,
                }
            },
            timeout=120.0,  # local models can be slow on first run
        )
        response.raise_for_status()
        data = response.json()

        # Ollama returns: {"message": {"role": "assistant", "content": "..."}}
        return data["message"]["content"]
