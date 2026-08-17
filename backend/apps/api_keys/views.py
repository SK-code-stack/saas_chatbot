from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import APIKey
from .serializers import APIKeySerializer, APIKeyCreateSerializer


class APIKeyViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return APIKey.objects.filter(user=self.request.user)

    # ── List all keys ──────────────────────────────────────────────
    @action(detail=False, methods=['get'])
    def list_keys(self, request):
        keys = self.get_queryset()
        serializer = APIKeySerializer(keys, many=True)
        return Response(serializer.data)

    # ── Create new key ─────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def create_key(self, request):
        serializer = APIKeyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Limit to 5 keys per user
        if self.get_queryset().count() >= 5:
            return Response(
                {'error': 'Maximum 5 API keys allowed per account'},
                status=status.HTTP_400_BAD_REQUEST
            )

        raw_key, hashed, prefix = APIKey.generate_key()

        api_key = APIKey.objects.create(
            user=request.user,
            name=serializer.validated_data['name'],
            key_hash=hashed,
            key_prefix=prefix,
        )

        # Auto-create widget config with defaults
        from .models import WidgetConfig
        WidgetConfig.objects.get_or_create(api_key=api_key)

        return Response({
            'id': api_key.id,
            'name': api_key.name,
            'key_prefix': api_key.key_prefix,
            'raw_key': raw_key,  # shown ONCE only
            'created_at': api_key.created_at,
            'warning': 'Save this key now. It will never be shown again.'
        }, status=status.HTTP_201_CREATED)

    # ── Revoke key ─────────────────────────────────────────────────
    @action(detail=True, methods=['post'])
    def revoke(self, request, pk=None):
        try:
            api_key = self.get_queryset().get(id=pk)
        except APIKey.DoesNotExist:
            return Response({'error': 'Key not found'}, status=status.HTTP_404_NOT_FOUND)

        api_key.is_active = False
        api_key.save(update_fields=['is_active'])
        return Response({'message': f'Key {api_key.key_prefix}... revoked'})

    # ── Delete key ─────────────────────────────────────────────────
    @action(detail=True, methods=['delete'])
    def delete_key(self, request, pk=None):
        try:
            api_key = self.get_queryset().get(id=pk)
        except APIKey.DoesNotExist:
            return Response({'error': 'Key not found'}, status=status.HTTP_404_NOT_FOUND)

        api_key.delete()
        return Response({'message': 'Key deleted'}, status=status.HTTP_204_NO_CONTENT)

    # ── Usage stats ────────────────────────────────────────────────
    @action(detail=True, methods=['get'])
    def usage(self, request, pk=None):
        try:
            api_key = self.get_queryset().get(id=pk)
        except APIKey.DoesNotExist:
            return Response({'error': 'Key not found'}, status=status.HTTP_404_NOT_FOUND)

        logs = api_key.logs.values(
            'endpoint', 'response_status', 'created_at'
        ).order_by('-created_at')[:50]

        return Response({
            'key_name': api_key.name,
            'total_requests': api_key.total_requests,
            'last_used_at': api_key.last_used_at,
            'recent_logs': list(logs)
        })