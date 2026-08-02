from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .authentication import APIKeyAuthentication
from apps.chatbot.models import ChatSession, ChatMessage
from apps.chatbot.services import ChatbotService


class PublicChatView(APIView):
    """
    The endpoint developers call from their apps.
    Auth: Api-Key sk_live_xxxx
    This is what the script tag widget also calls.
    """
    authentication_classes = [APIKeyAuthentication]
    permission_classes = []

    def post(self, request):
        question = request.data.get('question', '').strip()
        document_ids = request.data.get('document_ids', [])
        system_prompt = request.data.get('system_prompt', None)
        session_id = request.data.get('session_id', None)
        chat_history = []

        if not question:
            return Response(
                {'error': 'question is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not document_ids:
            return Response(
                {'error': 'document_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, user=request.user)
                chat_history = list(
                    session.messages.values('role', 'content').order_by('-created_at')[:6]
                )
                chat_history.reverse()
            except ChatSession.DoesNotExist:
                pass
        else:
            session = ChatSession.objects.create(
                user=request.user,
                title=question[:50],
                document_ids=document_ids,
                system_prompt=system_prompt,
            )

        # Save user message
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=question,
        )

        # Call FastAPI RAG
        try:
            result = ChatbotService.ask(
                question=question,
                document_ids=document_ids,
                system_prompt=system_prompt,
                chat_history=chat_history,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save assistant message
        ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=result['answer'],
            sources=result['sources'],
        )

        return Response({
            'answer': result['answer'],
            'session_id': session.id,
            'sources': result['sources'],
            'chunks_used': result['chunks_used'],
        })