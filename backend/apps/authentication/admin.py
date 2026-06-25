from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, OTP, PendingUserRegistration

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'first_name', 'last_name', 'role', 'is_verified', 'created_at']
    list_filter = ['role', 'is_verified', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('SaaS Info', {'fields': ('role', 'company_name', 'is_verified')}),
    )

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ['email', 'otp', 'is_used', 'created_at']

@admin.register(PendingUserRegistration)
class PendingUserAdmin(admin.ModelAdmin):
    list_display = ['email', 'role', 'otp_is_used', 'created_at']