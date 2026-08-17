"""
Provider abstraction for LLM inference.

To add a new provider:
  1. Create a new file: providers/my_provider.py
  2. Subclass BaseProvider and implement generate()
  3. Register it in factory.py

To switch providers, set LLM_PROVIDER in .env:
  LLM_PROVIDER=gemini       → Google Gemini
  LLM_PROVIDER=openrouter   → OpenRouter (multiple models, load balanced)
  LLM_PROVIDER=local        → Ollama / llama.cpp (local inference)

To enable load balancing across multiple providers:
  LLM_LOAD_BALANCE=True
"""

from .base import BaseProvider

__all__ = ["BaseProvider"]
