from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Plan, Subscription
from .serializers import PlanSerializer, SubscriptionSerializer
from .stripe_service import StripeService


class PlanListView(APIView):
    """GET /api/billing/plans/ — list all active plans (public)"""
    permission_classes = [AllowAny]

    def get(self, request):
        plans = Plan.objects.filter(is_active=True)
        return Response(PlanSerializer(plans, many=True).data)


class SubscriptionView(APIView):
    """GET /api/billing/subscription/ — current user's subscription"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            sub = request.user.subscription
            return Response(SubscriptionSerializer(sub).data)
        except Subscription.DoesNotExist:
            # Auto-assign free plan if no subscription exists
            try:
                free_plan = Plan.objects.get(name=Plan.FREE)
                sub = Subscription.objects.create(
                    user=request.user,
                    plan=free_plan,
                    status=Subscription.STATUS_ACTIVE,
                )
                return Response(SubscriptionSerializer(sub).data)
            except Plan.DoesNotExist:
                return Response(
                    {'error': 'No subscription found and no free plan configured.'},
                    status=status.HTTP_404_NOT_FOUND
                )


class CheckoutView(APIView):
    """POST /api/billing/subscribe/ — create Stripe checkout session"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        plan_id = request.data.get('plan_id')
        if not plan_id:
            return Response({'error': 'plan_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({'error': 'Plan not found'}, status=status.HTTP_404_NOT_FOUND)

        if plan.is_free():
            return Response({'error': 'Cannot checkout a free plan'}, status=status.HTTP_400_BAD_REQUEST)

        if not plan.stripe_price_id:
            return Response(
                {'error': 'This plan is not yet available for purchase.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Build return URLs
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        success_url = f"{frontend_url}/billing/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/billing"

        try:
            checkout_url = StripeService.create_checkout_session(
                user=request.user,
                plan=plan,
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return Response({'checkout_url': checkout_url})
        except Exception as e:
            return Response(
                {'error': f'Stripe error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class CustomerPortalView(APIView):
    """POST /api/billing/portal/ — Stripe billing portal"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        frontend_url = settings.FRONTEND_URL.rstrip('/')
        return_url = f"{frontend_url}/billing"

        try:
            portal_url = StripeService.create_customer_portal(
                user=request.user,
                return_url=return_url,
            )
            return Response({'portal_url': portal_url})
        except Exception as e:
            return Response(
                {'error': f'Stripe error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class StripeWebhookView(APIView):
    """
    POST /api/billing/webhook/ — Stripe webhook endpoint.
    Must be registered in Stripe Dashboard → Developers → Webhooks.
    No JWT auth — verified by Stripe signature instead.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE', '')

        try:
            event_type = StripeService.handle_webhook(payload, sig_header)
            return Response({'received': True, 'event': event_type})
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {'error': f'Webhook error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
