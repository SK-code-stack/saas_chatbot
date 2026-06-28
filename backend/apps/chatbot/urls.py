from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatViewSet

router = DefaultRouter()
router.register('', ChatViewSet, basename='chat')

urlpatterns = [
    path('', include(router.urls)),
]

# POST /api/chatbot/start_session/    → Create chat session
# POST /api/chatbot/<id>/ask/         → Send message
# GET  /api/chatbot/<id>/history/     → Get chat history
# GET  /api/chatbot/sessions/         → List all sessions