from rest_framework import serializers
from .models import APIKey


class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'key_prefix', 'is_active',
            'total_requests', 'last_used_at', 'created_at'
        ]
        read_only_fields = fields


class APIKeyCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)


class APIKeyCreatedSerializer(serializers.ModelSerializer):
    """
    Used ONLY when key is first created.
    Includes the raw key which we never show again.
    """
    raw_key = serializers.CharField()

    class Meta:
        model = APIKey
        fields = [
            'id', 'name', 'key_prefix',
            'raw_key', 'created_at'
        ]