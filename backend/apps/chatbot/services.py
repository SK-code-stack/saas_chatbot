import requests
from django.conf import settings


class ChatbotService:

    @staticmethod
    def ask(question, document_ids, system_prompt, chat_history=None, top_k=5):
        try:
            payload = {
                'question': question,
                'document_ids': document_ids,
                'system_prompt': system_prompt or "",
                'chat_history': chat_history or [],
                'top_k': top_k,
            }
            print("[ChatbotService] Sending payload:", payload)  # debug

            response = requests.post(
                f"{settings.FASTAPI_URL}/chat/ask",
                json=payload,
                headers={
                    'x-internal-secret': settings.FASTAPI_INTERNAL_SECRET
                },
                timeout=30
            )
            print("[ChatbotService] FastAPI response:", response.status_code, response.text)  # debug
            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            raise Exception('AI service timed out.')
        except requests.exceptions.ConnectionError:
            raise Exception('AI service unavailable.')
        except Exception as e:
            raise Exception(f'Chat failed: {str(e)}')