"""
POST  /api/auth/register/          → Register (sends OTP)
POST  /api/auth/verify_otp/        → Verify OTP (activates account)
POST  /api/auth/resend_otp/        → Resend OTP
POST  /api/auth/login/             → Login
POST  /api/auth/admin_login/       → Admin login
POST  /api/auth/logout/            → Logout
GET   /api/auth/profile/           → Get profile
PUT   /api/auth/profile/           → Update profile
POST  /api/auth/change_password/   → Change password
POST  /api/auth/forgot_password/   → Send reset OTP
POST  /api/auth/reset_password/    → Reset with OTP
POST  /api/auth/delete_account/    → Delete account
POST  /api/auth/token/refresh/     → Refresh JWT token
GET   /api/auth/admin/users/       → Admin list users
GET   /api/auth/admin/stats/       → Admin stats
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import AuthViewSet

router = DefaultRouter()
router.register('', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]