from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class Plan(models.Model):
    """
    Subscription plan definitions.
    Create plans via Django admin or management command.
    Stripe price IDs link these to Stripe's billing.
    """
    FREE = 'free'
    PRO = 'pro'
    ENTERPRISE = 'enterprise'

    NAME_CHOICES = [
        (FREE, 'Free'),
        (PRO, 'Pro'),
        (ENTERPRISE, 'Enterprise'),
    ]

    name = models.CharField(max_length=20, choices=NAME_CHOICES, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    # Stripe
    stripe_price_id = models.CharField(max_length=100, blank=True, help_text='Stripe Price ID e.g. price_xxx')
    stripe_product_id = models.CharField(max_length=100, blank=True)

    # Pricing
    price_monthly = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    price_yearly = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    # Limits
    max_documents = models.IntegerField(default=3, help_text='Max documents per account (-1 = unlimited)')
    max_api_keys = models.IntegerField(default=1, help_text='Max API keys (-1 = unlimited)')
    max_requests_per_month = models.IntegerField(default=100, help_text='Max chat requests/month (-1 = unlimited)')
    max_file_size_mb = models.IntegerField(default=5, help_text='Max file size in MB')

    # Features
    widget_customization = models.BooleanField(default=False)
    priority_support = models.BooleanField(default=False)
    custom_domain = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'billing_plans'
        ordering = ['price_monthly']

    def __str__(self):
        return f'{self.display_name} (${self.price_monthly}/mo)'

    def is_free(self):
        return self.name == self.FREE


class Subscription(models.Model):
    """
    Links a User to a Plan via Stripe.
    One active subscription per user.
    """
    STATUS_ACTIVE = 'active'
    STATUS_CANCELED = 'canceled'
    STATUS_PAST_DUE = 'past_due'
    STATUS_TRIALING = 'trialing'
    STATUS_INCOMPLETE = 'incomplete'

    STATUS_CHOICES = [
        (STATUS_ACTIVE, 'Active'),
        (STATUS_CANCELED, 'Canceled'),
        (STATUS_PAST_DUE, 'Past Due'),
        (STATUS_TRIALING, 'Trialing'),
        (STATUS_INCOMPLETE, 'Incomplete'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name='subscriptions')

    # Stripe identifiers
    stripe_customer_id = models.CharField(max_length=100, blank=True)
    stripe_subscription_id = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)

    # Usage tracking (reset monthly)
    requests_this_month = models.IntegerField(default=0)
    requests_reset_at = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'billing_subscriptions'

    def __str__(self):
        return f'{self.user.email} → {self.plan.display_name} ({self.status})'

    def is_active(self):
        return self.status in [self.STATUS_ACTIVE, self.STATUS_TRIALING]

    def requests_remaining(self):
        limit = self.plan.max_requests_per_month
        if limit == -1:
            return -1  # unlimited
        return max(0, limit - self.requests_this_month)

    def increment_requests(self):
        """Increment usage counter. Resets monthly."""
        now = timezone.now()
        # Reset if a month has passed since last reset
        if self.requests_reset_at.month != now.month or self.requests_reset_at.year != now.year:
            self.requests_this_month = 0
            self.requests_reset_at = now
        self.requests_this_month += 1
        self.save(update_fields=['requests_this_month', 'requests_reset_at'])
