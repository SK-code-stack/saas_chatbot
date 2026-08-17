from django.urls import path
from .views import (
    PlanListView, SubscriptionView, CheckoutView,
    CustomerPortalView, StripeWebhookView,
)

urlpatterns = [
    # GET  /api/billing/plans/         → list all plans (public)
    path('plans/', PlanListView.as_view(), name='billing-plans'),

    # GET  /api/billing/subscription/  → current user's subscription
    path('subscription/', SubscriptionView.as_view(), name='billing-subscription'),

    # POST /api/billing/subscribe/     → start Stripe checkout
    path('subscribe/', CheckoutView.as_view(), name='billing-subscribe'),

    # POST /api/billing/portal/        → Stripe billing portal
    path('portal/', CustomerPortalView.as_view(), name='billing-portal'),

    # POST /api/billing/webhook/       → Stripe webhook (no auth, sig-verified)
    path('webhook/', StripeWebhookView.as_view(), name='billing-webhook'),
]
