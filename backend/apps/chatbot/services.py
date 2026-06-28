import requests
from django.conf import settings


class ChatbotService:

    @staticmethod
    def ask(question, document_ids, system_prompt=None, chat_history=None, top_k=5):
        """
        Django calls FastAPI internally.
        This keeps AI logic in FastAPI and business logic in Django.
        """
        try:
            response = requests.post(
                f"{settings.FASTAPI_URL}/chat/ask",
                json={
                    'question': question,
                    'document_ids': document_ids,
                    'system_prompt': system_prompt,
                    'chat_history': chat_history or [],
                    'top_k': top_k,
                },
                headers={
                    'x-internal-secret': settings.FASTAPI_INTERNAL_SECRET
                },
                timeout=30
            )
            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            raise Exception('AI service timed out. Please try again.')
        except requests.exceptions.ConnectionError:
            raise Exception('AI service is unavailable.')
        except Exception as e:
            raise Exception(f'Chat failed: {str(e)}')