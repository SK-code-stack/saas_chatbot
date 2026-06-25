from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # ← add this
    path('api/auth/', include('apps.authentication.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/keys/', include('apps.api_keys.urls')),
    path('api/billing/', include('apps.billing.urls')),
]