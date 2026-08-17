from rest_framework import serializers
from .models import Plan, Subscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            'id', 'name', 'display_name', 'description',
            'price_monthly', 'price_yearly',
            'max_documents', 'max_api_keys', 'max_requests_per_month',
            'max_file_size_mb', 'widget_customization',
            'priority_support', 'custom_domain',
        ]


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    requests_remaining = serializers.SerializerMethodField()

    class Meta:
        model = Subscription
        fields = [
            'id', 'plan', 'status',
            'current_period_start', 'current_period_end',
            'requests_this_month', 'requests_remaining',
            'created_at',
        ]

    def get_requests_remaining(self, obj):
        return obj.requests_remaining()
