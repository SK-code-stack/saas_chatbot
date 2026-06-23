from django.urls import path, include

urlpatterns = [
    path('api/auth/', include('apps.authentication.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/keys/', include('apps.api_keys.urls')),
    path('api/billing/', include('apps.billing.urls')),
]