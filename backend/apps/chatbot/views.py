from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ChatSession, ChatMessage
from .services import ChatbotService


class ChatViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    # ── Create new session ─────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def start_session(self, request):
        document_ids = request.data.get('document_ids', [])
        system_prompt = request.data.get('system_prompt', None)
        title = request.data.get('title', 'New Chat')

        if not document_ids:
            return Response(
                {'error': 'Provide at least one document_id'},
                status=status.HTTP_400_BAD_REQUEST
            )

        session = ChatSession.objects.create(
            user=request.user,
            title=title,
            document_ids=document_ids,
            system_prompt=system_prompt,
        )

        return Response({
            'session_id': session.id,
            'title': session.title,
            'document_ids': session.document_ids,
        }, status=status.HTTP_201_CREATED)

    # ── Send message ───────────────────────────────────────────────
    @action(detail=True, methods=['post'])
    def ask(self, request, pk=None):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        question = request.data.get('question', '').strip()
        if not question:
            return Response({'error': 'Question is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Get last 6 messages for history
        history = list(
            session.messages.values('role', 'content').order_by('-created_at')[:6]
        )
        history.reverse()

        # Save user message
        ChatMessage.objects.create(
            session=session,
            role='user',
            content=question,
        )

        # Call FastAPI
        try:
            result = ChatbotService.ask(
                question=question,
                document_ids=session.document_ids,
                system_prompt=session.system_prompt,
                chat_history=history,
            )
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save assistant response
        ChatMessage.objects.create(
            session=session,
            role='assistant',
            content=result['answer'],
            sources=result['sources'],
        )

        session.save()  # updates updated_at

        return Response({
            'answer': result['answer'],
            'sources': result['sources'],
            'chunks_used': result['chunks_used'],
        })

    # ── Get chat history ───────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        try:
            session = ChatSession.objects.get(id=pk, user=request.user)
        except ChatSession.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)

        messages = session.messages.values('role', 'content', 'sources', 'created_at')
        return Response({
            'session_id': session.id,
            'messages': list(messages)
        })

    # ── List all sessions ──────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def sessions(self, request):
        sessions = ChatSession.objects.filter(user=request.user).values(
            'id', 'title', 'document_ids', 'created_at', 'updated_at'
        )
        return Response(list(sessions))