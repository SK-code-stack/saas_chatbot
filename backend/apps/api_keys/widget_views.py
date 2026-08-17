"""
Widget configuration views.

GET  /api/keys/<id>/widget-config/  → get widget config for an API key
PUT  /api/keys/<id>/widget-config/  → update widget config
POST /api/keys/<id>/widget-icon/    → upload custom icon, returns icon_url
GET  /api/keys/<id>/widget-config/public/ → public endpoint used by widget.js (no auth)
"""
import uuid
import io
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from supabase import create_client

from .models import APIKey, WidgetConfig
from .serializers import WidgetConfigSerializer, WidgetIconUploadSerializer


class WidgetConfigView(APIView):
    """GET / PUT — authenticated owner manages their widget config."""
    permission_classes = [IsAuthenticated]

    def _get_api_key(self, request, pk):
        try:
            return APIKey.objects.get(id=pk, user=request.user)
        except APIKey.DoesNotExist:
            return None

    def get(self, request, pk):
        api_key = self._get_api_key(request, pk)
        if not api_key:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)

        config, _ = WidgetConfig.objects.get_or_create(api_key=api_key)
        return Response(WidgetConfigSerializer(config).data)

    def put(self, request, pk):
        api_key = self._get_api_key(request, pk)
        if not api_key:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)

        config, _ = WidgetConfig.objects.get_or_create(api_key=api_key)
        serializer = WidgetConfigSerializer(config, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class WidgetConfigPublicView(APIView):
    """
    GET /api/keys/<id>/widget-config/public/
    Public endpoint — no auth required.
    Called by widget.js on load to fetch config (colors, bot name, etc.)
    Only exposes safe display fields, no sensitive data.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            api_key = APIKey.objects.get(id=pk, is_active=True)
        except APIKey.DoesNotExist:
            return Response({'error': 'Invalid API key'}, status=status.HTTP_404_NOT_FOUND)

        config, _ = WidgetConfig.objects.get_or_create(api_key=api_key)
        return Response(WidgetConfigSerializer(config).data)


class WidgetIconUploadView(APIView):
    """
    POST /api/keys/<id>/widget-icon/
    Uploads a custom icon image to Supabase Storage.
    Returns the public URL which is then saved into WidgetConfig.icon_url.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            api_key = APIKey.objects.get(id=pk, user=request.user)
        except APIKey.DoesNotExist:
            return Response({'error': 'API key not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = WidgetIconUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        icon_file = serializer.validated_data['icon']
        extension = icon_file.name.rsplit('.', 1)[-1].lower()

        if extension not in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']:
            return Response(
                {'error': 'Unsupported image type. Use PNG, JPG, GIF, WebP, or SVG.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Upload to Supabase under widgets/ folder
        unique_name = f"widgets/{api_key.user_id}/{uuid.uuid4()}.{extension}"
        file_bytes = icon_file.read()

        content_type_map = {
            'png': 'image/png', 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'gif': 'image/gif', 'webp': 'image/webp', 'svg': 'image/svg+xml',
        }

        try:
            supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
            supabase.storage.from_(settings.SUPABASE_BUCKET).upload(
                path=unique_name,
                file=file_bytes,
                file_options={"content-type": content_type_map.get(extension, 'image/png')},
            )
            icon_url = supabase.storage.from_(settings.SUPABASE_BUCKET).get_public_url(unique_name)
        except Exception as e:
            return Response(
                {'error': f'Upload failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save URL to config
        config, _ = WidgetConfig.objects.get_or_create(api_key=api_key)
        config.icon_url = icon_url
        config.save(update_fields=['icon_url'])

        return Response({'icon_url': icon_url})
