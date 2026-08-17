from rest_framework import serializers
from .models import APIKey, WidgetConfig


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


class WidgetConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = WidgetConfig
        fields = [
            'bot_name', 'welcome_message',
            'light_primary_color', 'light_secondary_color',
            'dark_primary_color', 'dark_secondary_color',
            'force_dark_mode', 'allow_user_toggle',
            'icon_url', 'icon_emoji', 'position',
        ]


class WidgetIconUploadSerializer(serializers.Serializer):
    icon = serializers.ImageField(help_text='Widget bubble icon image')