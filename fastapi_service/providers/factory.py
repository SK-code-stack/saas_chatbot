"""
ProviderFactory — creates and manages LLM provider instances.

Load Balancing Strategy:
  When LLM_LOAD_BALANCE=True, requests round-robin across all configured
  providers. If a provider fails, the next one in the list takes over.

  Provider order: Gemini → OpenRouter → (Local if configured)

  This ensures:
  - Gemini rate limits don't block service
  - OpenRouter acts as automatic overflow
  - Zero downtime if one provider is degraded

Single Provider Mode:
  When LLM_LOAD_BALANCE=False, uses only the provider set in LLM_PROVIDER.
"""
import threading
from core.config import settings
from .base import BaseProvider


class ProviderFactory:
    _instances: list[BaseProvider] = []
    _index: int = 0
    _lock = threading.Lock()
    _initialized: bool = False

    @classmethod
    def _build_providers(cls) -> list[BaseProvider]:
        """Build list of enabled providers based on config."""
        # Import here to avoid circular imports and to lazy-load
        from .gemini_provider import GeminiProvider
        from .openrouter_provider import OpenRouterProvider
        from .local_provider import LocalProvider

        if settings.LLM_LOAD_BALANCE:
            # Load balance mode: include all providers with valid config
            providers = []
            if settings.GEMINI_API_KEY:
                providers.append(GeminiProvider())
            if settings.OPENROUTER_API_KEY:
                providers.append(OpenRouterProvider())
            # Uncomment to include local in load balancing:
            # providers.append(LocalProvider())
            if not providers:
                raise ValueError(
                    "LLM_LOAD_BALANCE=True but no providers are configured. "
                    "Set GEMINI_API_KEY and/or OPENROUTER_API_KEY."
                )
            return providers

        # Single provider mode
        provider = settings.LLM_PROVIDER.lower()
        if provider == "gemini":
            return [GeminiProvider()]
        elif provider == "openrouter":
            return [OpenRouterProvider()]
        elif provider == "local":
            return [LocalProvider()]
        else:
            raise ValueError(
                f"Unknown LLM_PROVIDER: '{provider}'. "
                f"Choose from: gemini, openrouter, local"
            )

    @classmethod
    def _ensure_initialized(cls):
        """Lazy singleton initialization (thread-safe)."""
        if not cls._initialized:
            with cls._lock:
                if not cls._initialized:
                    cls._instances = cls._build_providers()
                    cls._initialized = True

    @classmethod
    def get(cls) -> BaseProvider:
        """
        Get the next provider (round-robin if load balancing, fixed if single).
        """
        cls._ensure_initialized()
        with cls._lock:
            provider = cls._instances[cls._index % len(cls._instances)]
            if len(cls._instances) > 1:
                cls._index += 1
            return provider

    @classmethod
    def reset(cls):
        """
        Force re-initialization. Useful in tests or after config change.
        """
        with cls._lock:
            cls._instances = []
            cls._index = 0
            cls._initialized = False
