import random
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):
    """
    DEVELOPER  → wants API key + REST integration
    BUSINESS   → wants widget + dashboard
    """
    DEVELOPER = 'developer'
    BUSINESS = 'business'

    ROLE_CHOICES = [
        (DEVELOPER, 'Developer'),
        (BUSINESS, 'Business'),
    ]

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=BUSINESS)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    def is_developer(self):
        return self.role == self.DEVELOPER

    def is_business(self):
        return self.role == self.BUSINESS

    def is_platform_admin(self):
        return self.is_superuser


class OTP(models.Model):
    """For password reset — logged out users"""
    email = models.EmailField()
    otp = models.CharField(max_length=4)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        db_table = 'otps'

    def is_valid(self):
        return not self.is_used and timezone.now() < self.created_at + timedelta(minutes=10)

    @staticmethod
    def generate_otp():
        return str(random.randint(1000, 9999))


class PendingUserRegistration(models.Model):
    """
    Holds registration data until OTP verified.
    User only moves to User table after OTP confirmation.
    This is the same pattern from your existing auth app.
    """
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150)
    first_name = models.CharField(max_length=150, blank=True)
    last_name = models.CharField(max_length=150, blank=True)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    role = models.CharField(max_length=20, choices=User.ROLE_CHOICES, default=User.BUSINESS)
    password = models.CharField(max_length=128)
    otp = models.CharField(max_length=4)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField()
    otp_is_used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pending_registrations'

    def __str__(self):
        return f"Pending: {self.email}"

    def is_valid_otp(self, code):
        return (
            self.otp == code
            and not self.otp_is_used
            and self.otp_expires_at >= timezone.now()
        )

    def mark_otp_used(self):
        self.otp_is_used = True
        self.save(update_fields=['otp_is_used'])

    def refresh_otp(self, otp_code, expires_at):
        self.otp = otp_code
        self.otp_created_at = timezone.now()
        self.otp_expires_at = expires_at
        self.otp_is_used = False
        self.save(update_fields=['otp', 'otp_created_at', 'otp_expires_at', 'otp_is_used'])