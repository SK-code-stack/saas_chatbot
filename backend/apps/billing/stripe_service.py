"""
StripeService — wraps all Stripe API calls.

Stripe Flow:
  1. User clicks "Upgrade" → POST /api/billing/subscribe/ 
     → StripeService.create_checkout_session() 
     → Returns {checkout_url}
     → Frontend redirects user to Stripe hosted checkout page
  
  2. User completes payment on Stripe 
     → Stripe sends webhook to POST /api/billing/webhook/
     → StripeService.handle_webhook() processes event
     → Subscription record updated in DB
     → User can now access Pro features

  3. User clicks "Manage Billing" 
     → POST /api/billing/portal/
     → StripeService.create_customer_portal()
     → Returns {portal_url}
     → User manages invoices/cancellation on Stripe

https://stripe.com/docs/billing/subscriptions/overview
"""
import stripe
from django.conf import settings
from django.utils import timezone
from .models import Plan, Subscription


stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:

    @staticmethod
    def get_or_create_customer(user) -> str:
        """
        Get existing Stripe customer ID or create a new one.
        Returns the stripe_customer_id string.
        """
        sub = getattr(user, 'subscription', None)
        if sub and sub.stripe_customer_id:
            return sub.stripe_customer_id

        customer = stripe.Customer.create(
            email=user.email,
            name=f"{user.first_name} {user.last_name}".strip() or user.email,
            metadata={'user_id': str(user.id)},
        )
        return customer.id

    @staticmethod
    def create_checkout_session(user, plan: Plan, success_url: str, cancel_url: str) -> str:
        """
        Create a Stripe Checkout Session for the given plan.
        Returns the checkout URL to redirect the user to.
        """
        customer_id = StripeService.get_or_create_customer(user)

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            mode='subscription',
            line_items=[{
                'price': plan.stripe_price_id,
                'quantity': 1,
            }],
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                'user_id': str(user.id),
                'plan_id': str(plan.id),
            },
            subscription_data={
                'metadata': {
                    'user_id': str(user.id),
                    'plan_id': str(plan.id),
                }
            },
            allow_promotion_codes=True,
        )
        return session.url

    @staticmethod
    def create_customer_portal(user, return_url: str) -> str:
        """
        Create a Stripe Billing Portal session.
        Users can manage invoices, payment methods, and cancel here.
        """
        customer_id = StripeService.get_or_create_customer(user)
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return session.url

    @staticmethod
    def handle_webhook(payload: bytes, sig_header: str):
        """
        Verify Stripe webhook signature and process event.
        Must use raw bytes (not parsed JSON) for signature verification.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise ValueError("Invalid Stripe webhook signature")

        event_type = event['type']
        data = event['data']['object']

        if event_type == 'checkout.session.completed':
            StripeService._handle_checkout_complete(data)

        elif event_type in ('customer.subscription.updated', 'customer.subscription.created'):
            StripeService._handle_subscription_updated(data)

        elif event_type == 'customer.subscription.deleted':
            StripeService._handle_subscription_canceled(data)

        elif event_type == 'invoice.payment_failed':
            StripeService._handle_payment_failed(data)

        return event_type

    @staticmethod
    def _handle_checkout_complete(session):
        """Checkout completed → create/update Subscription record."""
        from django.contrib.auth import get_user_model
        User = get_user_model()

        user_id = session['metadata'].get('user_id')
        plan_id = session['metadata'].get('plan_id')
        stripe_customer_id = session['customer']
        stripe_subscription_id = session['subscription']

        if not user_id or not plan_id:
            return

        try:
            user = User.objects.get(id=user_id)
            plan = Plan.objects.get(id=plan_id)
        except (User.DoesNotExist, Plan.DoesNotExist):
            return

        # Fetch full subscription details from Stripe
        stripe_sub = stripe.Subscription.retrieve(stripe_subscription_id)

        Subscription.objects.update_or_create(
            user=user,
            defaults={
                'plan': plan,
                'stripe_customer_id': stripe_customer_id,
                'stripe_subscription_id': stripe_subscription_id,
                'status': stripe_sub['status'],
                'current_period_start': timezone.datetime.fromtimestamp(
                    stripe_sub['current_period_start'], tz=timezone.utc
                ),
                'current_period_end': timezone.datetime.fromtimestamp(
                    stripe_sub['current_period_end'], tz=timezone.utc
                ),
            }
        )

    @staticmethod
    def _handle_subscription_updated(stripe_sub):
        """Subscription status changed → update our DB."""
        try:
            sub = Subscription.objects.get(
                stripe_subscription_id=stripe_sub['id']
            )
        except Subscription.DoesNotExist:
            return

        sub.status = stripe_sub['status']
        sub.current_period_start = timezone.datetime.fromtimestamp(
            stripe_sub['current_period_start'], tz=timezone.utc
        )
        sub.current_period_end = timezone.datetime.fromtimestamp(
            stripe_sub['current_period_end'], tz=timezone.utc
        )
        sub.save()

    @staticmethod
    def _handle_subscription_canceled(stripe_sub):
        """Subscription canceled → downgrade to Free plan."""
        try:
            sub = Subscription.objects.get(
                stripe_subscription_id=stripe_sub['id']
            )
            free_plan = Plan.objects.get(name=Plan.FREE)
            sub.plan = free_plan
            sub.status = Subscription.STATUS_CANCELED
            sub.stripe_subscription_id = ''
            sub.save()
        except (Subscription.DoesNotExist, Plan.DoesNotExist):
            pass

    @staticmethod
    def _handle_payment_failed(invoice):
        """Payment failed → mark subscription as past_due."""
        stripe_subscription_id = invoice.get('subscription')
        if not stripe_subscription_id:
            return
        try:
            sub = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            sub.status = Subscription.STATUS_PAST_DUE
            sub.save(update_fields=['status'])
        except Subscription.DoesNotExist:
            pass
