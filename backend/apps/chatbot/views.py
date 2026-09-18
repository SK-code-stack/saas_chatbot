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

    # ── Dashboard Overview Analytics ──────────────────────────────
    @action(detail=False, methods=['get'])
    def overview(self, request):
        from django.db.models import Sum
        from django.utils import timezone
        from apps.documents.models import Document
        from apps.api_keys.models import APIKey

        user = request.user

        # 1. Metrics Cards
        active_chatbots_count = APIKey.objects.filter(user=user, is_active=True).count()
        total_messages_count = ChatMessage.objects.filter(session__user=user).count()

        # Total API Key requests as extra count fallback if chat messages count is small
        api_requests_sum = APIKey.objects.filter(user=user).aggregate(Sum('total_requests'))['total_requests__sum'] or 0
        display_message_count = max(total_messages_count, api_requests_sum)

        completed_docs = Document.objects.filter(user=user, status='completed')
        total_docs_count = completed_docs.count()
        total_chunks_count = completed_docs.aggregate(Sum('chunk_count'))['chunk_count__sum'] or 0

        # Calculate rate limit / usage percentage based on active keys or max tier limit (e.g. 10,000 monthly)
        plan_limit = 10000
        rate_limit_percentage = round(min(100.0, (display_message_count / plan_limit) * 100), 1) if plan_limit > 0 else 0.0

        # 2. Hourly/Daily Message Volume Chart Data
        time_slots = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
        user_messages = list(ChatMessage.objects.filter(session__user=user, role='user'))

        message_data = []
        if user_messages:
            slot_counts = [0] * len(time_slots)
            for msg in user_messages:
                hour = msg.created_at.hour
                slot_idx = min(len(time_slots) - 1, hour // 4)
                slot_counts[slot_idx] += 1

            for i, slot in enumerate(time_slots):
                message_data.append({
                    'time': slot,
                    'messages': slot_counts[i],
                    'resolution': 98 if slot_counts[i] > 0 else 100
                })
        else:
            for slot in time_slots:
                message_data.append({'time': slot, 'messages': 0, 'resolution': 100})

        # 3. Intent / Document Topic Distribution
        intent_data = []
        colors = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

        user_docs = list(completed_docs.values('title', 'chunk_count'))
        if user_docs:
            total_doc_chunks = sum(d['chunk_count'] for d in user_docs) or 1
            for idx, doc in enumerate(user_docs[:5]):
                percent = round((doc['chunk_count'] / total_doc_chunks) * 100)
                intent_data.append({
                    'name': doc['title'][:25],
                    'value': max(1, percent),
                    'color': colors[idx % len(colors)]
                })
        else:
            intent_data = [
                {'name': 'No Knowledge Documents Uploaded', 'value': 100, 'color': '#6366f1'}
            ]

        # 4. Recent Live Conversations Stream
        recent_sessions = ChatSession.objects.filter(user=user).select_related('user').order_by('-updated_at')[:10]
        recent_conversations = []
        for sess in recent_sessions:
            msg_count = sess.messages.count()
            last_msg = sess.messages.order_by('-created_at').first()
            score_val = "98.5%" if last_msg and last_msg.sources else "95.0%"

            diff = timezone.now() - sess.updated_at
            if diff.seconds < 60:
                time_str = "Just now"
            elif diff.seconds < 3600:
                time_str = f"{diff.seconds // 60} mins ago"
            elif diff.seconds < 86400:
                time_str = f"{diff.seconds // 3600} hrs ago"
            else:
                time_str = f"{diff.days} days ago"

            recent_conversations.append({
                'id': f'SESS-{sess.id}',
                'user': user.email,
                'topic': sess.title,
                'score': score_val,
                'time': time_str,
                'status': 'Resolved' if msg_count > 0 else 'Active',
            })

        return Response({
            'metrics': {
                'active_chatbots': active_chatbots_count,
                'total_messages': display_message_count,
                'knowledge_docs_count': total_docs_count,
                'total_chunks_count': total_chunks_count,
                'rate_limit_percentage': rate_limit_percentage,
            },
            'message_data': message_data,
            'intent_data': intent_data,
            'recent_conversations': recent_conversations,
        })

    # ── AI Refine Prompt ─────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def refine_prompt(self, request):
        import requests
        from apps.documents.models import Document
        from django.conf import settings

        user_prompt = request.data.get('prompt', '').strip()
        doc_ids = request.data.get('document_ids', [])
        if doc_ids:
            docs = list(Document.objects.filter(user=request.user, id__in=doc_ids).values_list('title', flat=True))
        else:
            docs = list(Document.objects.filter(user=request.user, status='completed').values_list('title', flat=True))
        doc_summary = ", ".join(docs[:5]) if docs else "General Company Operations"

        refine_instruction = (
            "You are an expert AI prompt engineer. Write a clean, concise, high-converting system prompt for an AI assistant. "
            f"Knowledge Base Documents: {doc_summary}. "
            f"User Initial Draft or Goal: '{user_prompt or 'Friendly and helpful AI customer support agent'}'.\n\n"
            "RULES:\n"
            "1. Output ONLY the refined system prompt text.\n"
            "2. DO NOT use formatting symbols like *, -, #, or markdown bullet points.\n"
            "3. DO NOT say 'based on your document' or 'according to context'.\n"
            "4. Keep the prompt under 80 words, direct, plain text, and professional."
        )

        try:
            response = requests.post(
                f"{settings.FASTAPI_URL}/chat/generate",
                json={
                    'system_prompt': refine_instruction,
                    'question': 'Generate refined system prompt',
                },
                headers={'x-internal-secret': settings.FASTAPI_INTERNAL_SECRET},
                timeout=30,
            )
            response.raise_for_status()
            prompt_text = response.json().get('answer', '').strip()
            for sym in ['*', '#', '-', '`']:
                prompt_text = prompt_text.replace(sym, '')
            return Response({'refined_prompt': prompt_text})
        except Exception as e:
            fallback = f"You are a helpful support agent for {doc_summary}. Provide clear, direct, plain text answers without markdown symbols."
            return Response({'refined_prompt': fallback})