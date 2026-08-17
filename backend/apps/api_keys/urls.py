from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import APIKeyViewSet
from .public_views import PublicChatView
from .widget_views import WidgetConfigView, WidgetConfigPublicView, WidgetIconUploadView

router = DefaultRouter()
router.register('', APIKeyViewSet, basename='api-keys')

urlpatterns = [
    path('', include(router.urls)),

    # Public endpoint for developers and widget
    path('chat/', PublicChatView.as_view(), name='public-chat'),

    # Widget config — authenticated owner
    path('<int:pk>/widget-config/', WidgetConfigView.as_view(), name='widget-config'),
    path('<int:pk>/widget-icon/', WidgetIconUploadView.as_view(), name='widget-icon'),

    # Widget config — public (used by widget.js to load config on page)
    path('<int:pk>/widget-config/public/', WidgetConfigPublicView.as_view(), name='widget-config-public'),
]

# GET    /api/keys/list_keys/                    → List all keys
# POST   /api/keys/create_key/                   → Create new key
# POST   /api/keys/<id>/revoke/                  → Revoke key
# DELETE /api/keys/<id>/delete_key/              → Delete key
# GET    /api/keys/<id>/usage/                   → Usage stats
# POST   /api/keys/chat/                         → Public chat (API key auth)
# GET    /api/keys/<id>/widget-config/           → Get widget config
# PUT    /api/keys/<id>/widget-config/           → Update widget config
# POST   /api/keys/<id>/widget-icon/             → Upload custom icon
# GET    /api/keys/<id>/widget-config/public/    → Public config for widget.js