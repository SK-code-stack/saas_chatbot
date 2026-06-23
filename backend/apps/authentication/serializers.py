import random
from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from datetime import timedelta
from .models import PendingUserRegistration, User
from .validators import validate_password_strength


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'company_name', 'is_verified', 'created_at'
        )
        read_only_fields = ('id', 'created_at', 'is_verified')


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    company_name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default=User.BUSINESS)
    password = serializers.CharField(
        write_only=True,
        validators=[validate_password, validate_password_strength]
    )
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'password': "Passwords don't match"})
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'Email already registered'})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'Username already taken'})
        attrs['password'] = make_password(attrs['password'])
        attrs.pop('confirm_password')
        return attrs

    def create(self, validated_data):
        otp_code = str(random.randint(1000, 9999)).zfill(4)
        expires_at = timezone.now() + timedelta(minutes=20)
        pending, created = PendingUserRegistration.objects.get_or_create(
            email=validated_data['email'],
            defaults={
                'username': validated_data['username'],
                'first_name': validated_data['first_name'],
                'last_name': validated_data['last_name'],
                'company_name': validated_data.get('company_name', ''),
                'role': validated_data['role'],
                'password': validated_data['password'],
                'otp': otp_code,
                'otp_expires_at': expires_at,
            }
        )
        if not created:
            pending.username = validated_data['username']
            pending.first_name = validated_data['first_name']
            pending.last_name = validated_data['last_name']
            pending.company_name = validated_data.get('company_name', '')
            pending.role = validated_data['role']
            pending.password = validated_data['password']
            pending.refresh_otp(otp_code, expires_at)
            pending.save(update_fields=[
                'username', 'first_name', 'last_name',
                'company_name', 'role', 'password'
            ])
        return pending


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=4)


class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()