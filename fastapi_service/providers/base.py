"""
BaseProvider — abstract interface that all LLM providers must implement.

To implement a new provider, subclass this and override generate().
"""
from abc import ABC, abstractmethod
from typing import Optional


class BaseProvider(ABC):

    @abstractmethod
    def generate(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str] = None,
        chat_history: Optional[list] = None,
    ) -> str:
        """
        Generate an answer given question + retrieved context.

        Args:
            question:     The user's question.
            context:      Retrieved document chunks as formatted string.
            system_prompt: Optional custom instructions for this chatbot.
            chat_history:  List of {"role": "user"|"assistant", "content": "..."}

        Returns:
            The LLM's text response.
        """
        ...

    def _build_messages(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str],
        chat_history: Optional[list],
    ) -> list[dict]:
        """
        Shared helper: converts inputs into OpenAI-style message list.
        Useful for OpenRouter + local providers.
        """
        default_system = (
            "You are a helpful assistant. Answer questions based ONLY on the "
            "provided context. If the answer is not in the context, say "
            "'I don't have enough information to answer that.' "
            "Be concise and professional."
        )
        final_system = system_prompt if system_prompt else default_system

        context_block = f"CONTEXT FROM DOCUMENTS:\n{context}"

        messages = [
            {"role": "system", "content": f"{final_system}\n\n{context_block}"}
        ]

        if chat_history:
            for msg in chat_history[-6:]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"],
                })

        messages.append({"role": "user", "content": question})
        return messages

    def _build_prompt(
        self,
        question: str,
        context: str,
        system_prompt: Optional[str],
        chat_history: Optional[list],
    ) -> str:
        """
        Shared helper: builds a flat prompt string.
        Useful for Gemini and similar single-string providers.
        """
        default_system = (
            "You are a helpful assistant. Answer questions based ONLY on the "
            "provided context. If the answer is not in the context, say "
            "'I don't have enough information to answer that.' "
            "Be concise and professional."
        )
        final_system = system_prompt if system_prompt else default_system

        prompt = f"""SYSTEM INSTRUCTIONS:
{final_system}

CONTEXT FROM DOCUMENTS:
{context}

"""
        if chat_history:
            prompt += "PREVIOUS CONVERSATION:\n"
            for msg in chat_history[-6:]:
                role = "User" if msg["role"] == "user" else "Assistant"
                prompt += f"{role}: {msg['content']}\n"
            prompt += "\n"

        prompt += f"USER QUESTION:\n{question}\n\nANSWER:"
        return prompt
