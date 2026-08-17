from pydantic_settings import BaseSettings
from pathlib import Path
from typing import List


class Settings(BaseSettings):
    # ── Database ───────────────────────────────────────────────────
    DATABASE_URL: str
    FASTAPI_INTERNAL_SECRET: str

    # ── Gemini ────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""

    # ── LLM Provider Config ───────────────────────────────────────
    # Options: "gemini" | "openrouter" | "local"
    LLM_PROVIDER: str = "gemini"

    # When True, requests round-robin across all enabled providers.
    # Falls back to next provider if one fails.
    LLM_LOAD_BALANCE: bool = False

    # ── OpenRouter ────────────────────────────────────────────────
    OPENROUTER_API_KEY: str = ""
    # Comma-separated list of OpenRouter model IDs to cycle through
    OPENROUTER_MODELS: str = "google/gemini-flash-1.5,mistralai/mixtral-8x7b-instruct"
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # ── Local LLM (Ollama / llama.cpp compatible) ─────────────────
    LOCAL_LLM_URL: str = "http://localhost:11434"
    LOCAL_LLM_MODEL: str = "llama3"  # default Ollama model

    def get_openrouter_models(self) -> List[str]:
        """Parse comma-separated model list."""
        return [m.strip() for m in self.OPENROUTER_MODELS.split(",") if m.strip()]

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent / '.env')
        extra = 'ignore'


settings = Settings()