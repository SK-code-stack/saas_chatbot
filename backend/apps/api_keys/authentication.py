import hashlib
from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .models import APIKey


class APIKeyAuthentication(BaseAuthentication):
    """
    Custom DRF authentication class.
    Developers send: Authorization: Api-Key sk_live_xxxx
    We hash it and look it up in DB.
    If found and active → authenticate the request.
    """

    def authenticate(self, request):
        auth_header = request.headers.get('Authorization', '')
        raw_key = None

        if auth_header.startswith('Api-Key '):
            raw_key = auth_header[8:].strip()
        elif auth_header.startswith('Bearer ') and auth_header.startswith('Bearer sk_'):
            raw_key = auth_header[7:].strip()
        elif request.headers.get('X-Api-Key'):
            raw_key = request.headers.get('X-Api-Key').strip()

        if not raw_key:
            return None  # not our auth method, try next

        try:
            if raw_key.isdigit():
                api_key = APIKey.objects.select_related('user').get(
                    id=int(raw_key),
                    is_active=True
                )
            else:
                key_hash = hashlib.sha256(raw_key.encode()).hexdigest()
                try:
                    api_key = APIKey.objects.select_related('user').get(
                        key_hash=key_hash,
                        is_active=True
                    )
                except APIKey.DoesNotExist:
                    api_key = APIKey.objects.select_related('user').get(
                        key_hash=raw_key,
                        is_active=True
                    )
        except APIKey.DoesNotExist:
            raise AuthenticationFailed('Invalid or revoked API key')

        # Update usage stats
        api_key.total_requests += 1
        api_key.last_used_at = timezone.now()
        api_key.save(update_fields=['total_requests', 'last_used_at'])

        # Attach api_key to request for use in views
        request.api_key = api_key

        return (api_key.user, api_key)