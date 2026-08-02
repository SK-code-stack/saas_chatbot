import hashlib
import secrets
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class APIKey(models.Model):
    """
    Each user gets an API key to authenticate chatbot requests.
    We never store the raw key — only its SHA256 hash.
    The raw key is shown ONCE at creation then never again.
    This is the same approach GitHub/Stripe use.
    """

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='api_keys')
    name = models.CharField(max_length=100, help_text='e.g. Production, Website, Testing')
    key_hash = models.CharField(max_length=64, unique=True)  # SHA256 hash
    key_prefix = models.CharField(max_length=8)  # first 8 chars shown in dashboard
    is_active = models.BooleanField(default=True)
    last_used_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Usage tracking
    total_requests = models.IntegerField(default=0)

    class Meta:
        db_table = 'api_keys'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} — {self.user.email}'

    @staticmethod
    def generate_key():
        """
        Generate a secure random API key.
        Format: sk_live_<random64chars>
        Returns (raw_key, hashed_key, prefix)
        Raw key shown once, hash stored in DB.
        """
        raw_key = f"sk_live_{secrets.token_hex(32)}"
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()
        prefix = raw_key[:8]
        return raw_key, hashed, prefix

    @staticmethod
    def hash_key(raw_key: str) -> str:
        return hashlib.sha256(raw_key.encode()).hexdigest()


class APIKeyUsageLog(models.Model):
    """Track every request made with an API key."""
    api_key = models.ForeignKey(APIKey, on_delete=models.CASCADE, related_name='logs')
    endpoint = models.CharField(max_length=255)
    response_status = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'api_key_usage_logs'
        ordering = ['-created_at']