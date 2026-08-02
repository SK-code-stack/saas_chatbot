from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import APIKeyViewSet
from .public_views import PublicChatView

router = DefaultRouter()
router.register('', APIKeyViewSet, basename='api-keys')

urlpatterns = [
    path('', include(router.urls)),

    # Public endpoint for developers and widget
    path('chat/', PublicChatView.as_view(), name='public-chat'),
]

# GET    /api/keys/list_keys/        → List all keys
# POST   /api/keys/create_key/       → Create new key
# POST   /api/keys/<id>/revoke/      → Revoke key
# DELETE /api/keys/<id>/delete_key/  → Delete key
# GET    /api/keys/<id>/usage/       → Usage stats
# POST   /api/keys/chat/             → Public chat endpoint (API key auth)