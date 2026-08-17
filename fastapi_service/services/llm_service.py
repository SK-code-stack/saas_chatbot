"""
LLMService — provider-agnostic dispatcher.

Delegates to the active provider returned by ProviderFactory.
Provider selection is controlled entirely by .env:

  LLM_PROVIDER=gemini        → use Google Gemini
  LLM_PROVIDER=openrouter    → use OpenRouter (round-robin models)
  LLM_PROVIDER=local         → use local Ollama/llama.cpp
  LLM_LOAD_BALANCE=True      → round-robin across Gemini + OpenRouter

To switch to a locally downloaded LLM in the future:
  1. Set LLM_PROVIDER=local in fastapi_service/.env
  2. Set LOCAL_LLM_URL and LOCAL_LLM_MODEL
  3. Make sure Ollama is running: `ollama serve`
  Zero code changes needed.
"""
from providers.factory import ProviderFactory
from typing import Optional


class LLMService:

    @staticmethod
    def generate_response(
        question: str,
        context: str,
        system_prompt: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> str:
        """
        Generate an answer using whichever LLM provider is active.
        Provider is selected by ProviderFactory based on .env config.
        """
        provider = ProviderFactory.get()
        return provider.generate(
            question=question,
            context=context,
            system_prompt=system_prompt,
            chat_history=chat_history,
        )