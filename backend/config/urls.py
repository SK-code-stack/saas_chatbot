from django.contrib import admin
from django.urls import path, include
from apps.api_keys.widget_views import serve_widget_js

urlpatterns = [
    path('widget.js', serve_widget_js, name='widget-js'),
    path('static/widget.js', serve_widget_js, name='widget-js-static'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/documents/', include('apps.documents.urls')),
    path('api/chatbot/', include('apps.chatbot.urls')),
    path('api/keys/', include('apps.api_keys.urls')),
    path('api/billing/', include('apps.billing.urls')),
]