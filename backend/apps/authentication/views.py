from django.contrib.auth import authenticate
from rest_framework import viewsets, serializers, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta
from secrets import randbelow

from .models import PendingUserRegistration, User
from .email_service import EmailService, OTPService
from .serializers import (
    LoginSerializer, RegisterSerializer, UserSerializer,
    VerifyOTPSerializer, ResendOTPSerializer,
)
from .validators import validate_password_strength
from .permissions import IsPlatformAdmin


class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()

    def get_serializer_class(self):
        action_map = {
            'register': RegisterSerializer,
            'login': LoginSerializer,
            'verify_otp': VerifyOTPSerializer,
            'resend_otp': ResendOTPSerializer,
        }
        return action_map.get(self.action, UserSerializer)

    def get_permissions(self):
        public = [
            'register', 'verify_otp', 'resend_otp',
            'login', 'admin_login', 'forgot_password', 'reset_password',
        ]
        admin_only = ['admin_list_users', 'admin_delete_user', 'admin_stats']

        if self.action in public:
            return [AllowAny()]
        if self.action in admin_only:
            return [IsPlatformAdmin()]
        return [IsAuthenticated()]

    # ── Register ──────────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        pending = serializer.save()
        EmailService.send_otp_email(pending.email, pending.otp, pending.first_name)
        return Response({
            'message': 'OTP sent to your email. Verify to activate account.',
            'email': pending.email
        }, status=status.HTTP_201_CREATED)

    # ── Verify OTP → activate account ─────────────────────────────
    @action(detail=False, methods=['post'])
    def verify_otp(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        otp_code = serializer.validated_data['otp']

        try:
            pending = PendingUserRegistration.objects.get(email=email)
        except PendingUserRegistration.DoesNotExist:
            raise AuthenticationFailed('No pending registration for this email')

        if not pending.is_valid_otp(otp_code):
            raise AuthenticationFailed('Invalid or expired OTP')

        if User.objects.filter(email=email).exists():
            raise AuthenticationFailed('Account already exists')

        pending.mark_otp_used()

        # Create the real user
        user = User(
            email=pending.email,
            username=pending.username,
            first_name=pending.first_name,
            last_name=pending.last_name,
            company_name=pending.company_name,
            role=pending.role,
            is_active=True,
            is_verified=True,
        )
        user.password = pending.password
        user.save()
        pending.delete()

        EmailService.send_welcome_email(user)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Account verified successfully',
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)

    # ── Resend OTP ────────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def resend_otp(self, request):
        serializer = ResendOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        try:
            pending = PendingUserRegistration.objects.get(email=email)
        except PendingUserRegistration.DoesNotExist:
            raise AuthenticationFailed('No pending registration for this email')

        if pending.otp_is_used:
            return Response(
                {'error': 'OTP already used. Please register again.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_code = f"{randbelow(10000):04d}"
        expires_at = timezone.now() + timedelta(minutes=20)
        pending.refresh_otp(otp_code, expires_at)
        EmailService.send_otp_email(pending.email, otp_code, pending.first_name)

        return Response({'message': 'New OTP sent to your email'})

    # ── Login ─────────────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        user = authenticate(request, username=email, password=password)

        if not user:
            raise AuthenticationFailed('Invalid email or password')
        if not user.is_active:
            raise AuthenticationFailed('Account is inactive')
        if not user.is_verified:
            raise AuthenticationFailed('Please verify your email first')

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    # ── Admin Login ───────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def admin_login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Email and password required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=email, password=password)
        if not user:
            raise AuthenticationFailed('Invalid credentials')
        if not user.is_platform_admin():
            raise PermissionDenied('Admin access only')

        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    # ── Profile ───────────────────────────────────────────────────
    @action(detail=False, methods=['get', 'put', 'patch'])
    def profile(self, request):
        if request.method == 'GET':
            return Response(UserSerializer(request.user).data)
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    # ── Change Password (logged in) ───────────────────────────────
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        current = request.data.get('current_password')
        new = request.data.get('new_password')
        confirm = request.data.get('confirm_password')

        if not all([current, new, confirm]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)
        if new != confirm:
            return Response({'error': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)
        if not user.check_password(current):
            return Response({'error': 'Current password incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        if current == new:
            return Response({'error': 'New password must be different'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password_strength(new)
        except serializers.ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new)
        user.save()
        EmailService.send_password_change_notification(user)
        return Response({'message': 'Password updated successfully'})

    # ── Forgot Password ───────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def forgot_password(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Don't reveal if email exists
            return Response({'message': 'If this email exists an OTP has been sent'})
        return OTPService.generate_and_send(email, user.first_name)

    # ── Reset Password with OTP ───────────────────────────────────
    @action(detail=False, methods=['post'])
    def reset_password(self, request):
        email = request.data.get('email')
        otp_code = request.data.get('otp_code')
        new = request.data.get('new_password')
        confirm = request.data.get('confirm_password')

        if not all([email, otp_code, new, confirm]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)
        if new != confirm:
            return Response({'error': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        otp, error = OTPService.verify_otp(email, otp_code)
        if error:
            return error

        try:
            validate_password_strength(new)
        except serializers.ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        otp.is_used = True
        otp.save()
        user.set_password(new)
        user.save()
        EmailService.send_password_change_notification(user)
        return Response({'message': 'Password reset successfully'})

    # ── Logout ────────────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def logout(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception as e:
            return Response({'error': f'Invalid token: {e}'}, status=status.HTTP_400_BAD_REQUEST)

    # ── Delete Account ────────────────────────────────────────────
    @action(detail=False, methods=['post'])
    def delete_account(self, request):
        try:
            request.user.delete()
            return Response({'message': 'Account deleted'}, status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # ── Admin: List Users ─────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='admin/users')
    def admin_list_users(self, request):
        users = User.objects.all().values(
            'id', 'email', 'username', 'first_name', 'last_name',
            'role', 'company_name', 'is_active', 'is_verified', 'created_at'
        )
        return Response(list(users))

    # ── Admin: Stats ──────────────────────────────────────────────
    @action(detail=False, methods=['get'], url_path='admin/stats')
    def admin_stats(self, request):
        return Response({
            'total_users': User.objects.count(),
            'developers': User.objects.filter(role='developer').count(),
            'businesses': User.objects.filter(role='business').count(),
            'verified': User.objects.filter(is_verified=True).count(),
        })

    # ── Admin: Delete User ────────────────────────────────────────
    @action(detail=False, methods=['delete'], url_path='admin/users/(?P<user_id>[^/.]+)')
    def admin_delete_user(self, request, user_id=None):
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)