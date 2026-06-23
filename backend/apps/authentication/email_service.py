from django.core.mail import send_mail
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from .models import OTP

PLATFORM_NAME = 'ChatSaaS'  # change this to your platform name later


class EmailService:

    @staticmethod
    def send_otp_email(email, otp_code, first_name='User'):
        try:
            send_mail(
                subject=f'Verify your {PLATFORM_NAME} account',
                message=(
                    f'Hi {first_name},\n\n'
                    f'Your verification code is: {otp_code}\n\n'
                    f'Valid for 20 minutes.\n\n'
                    f'— {PLATFORM_NAME} Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"[Email Error] {e}")
            return False

    @staticmethod
    def send_password_change_notification(user):
        try:
            send_mail(
                subject=f'Password Updated — {PLATFORM_NAME}',
                message=(
                    f'Hi {user.first_name},\n\n'
                    f'Your password was successfully updated.\n\n'
                    f'If this was not you, contact support immediately.\n\n'
                    f'— {PLATFORM_NAME} Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"[Email Error] {e}")
            return False

    @staticmethod
    def send_welcome_email(user):
        try:
            send_mail(
                subject=f'Welcome to {PLATFORM_NAME}!',
                message=(
                    f'Hi {user.first_name},\n\n'
                    f'Your account is active. Start by uploading your first document.\n\n'
                    f'— {PLATFORM_NAME} Team'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            print(f"[Email Error] {e}")
            return False


class OTPService:

    @staticmethod
    def generate_and_send(email, first_name='User'):
        """Delete old OTP, generate new one, send it."""
        OTP.objects.filter(email=email).delete()
        otp_code = OTP.generate_otp()
        OTP.objects.create(email=email, otp=otp_code)

        if EmailService.send_otp_email(email, otp_code, first_name):
            return Response({'message': 'OTP sent to your email', 'email': email})
        return Response(
            {'error': 'Failed to send OTP. Try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    @staticmethod
    def verify_otp(email, otp_code):
        """Returns (otp_object, error_response). One of them will be None."""
        try:
            otp = OTP.objects.get(email=email, otp=otp_code)
            if not otp.is_valid():
                return None, Response(
                    {'error': 'OTP expired or already used'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            return otp, None
        except OTP.DoesNotExist:
            return None, Response(
                {'error': 'Invalid OTP'},
                status=status.HTTP_400_BAD_REQUEST
            )