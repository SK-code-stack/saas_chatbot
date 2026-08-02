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

        if not auth_header.startswith('Api-Key '):
            return None  # not our auth method, try next

        raw_key = auth_header.split('Api-Key ')[-1].strip()

        if not raw_key:
            raise AuthenticationFailed('API key is empty')

        # Hash and look up
        key_hash = hashlib.sha256(raw_key.encode()).hexdigest()

        try:
            api_key = APIKey.objects.select_related('user').get(
                key_hash=key_hash,
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