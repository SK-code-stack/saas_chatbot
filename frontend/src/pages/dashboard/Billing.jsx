import { useQuery, useMutation } from '@tanstack/react-query'
import { Check, CreditCard, ExternalLink, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'

const PLAN_FEATURES = {
  free: [
    '3 documents',
    '1 API key',
    '100 chat requests/month',
    '5MB max file size',
    'Basic widget',
  ],
  pro: [
    '50 documents',
    '5 API keys',
    '5,000 chat requests/month',
    '25MB max file size',
    'Widget customization',
    'Priority support',
  ],
  enterprise: [
    'Unlimited documents',
    'Unlimited API keys',
    'Unlimited requests',
    '100MB max file size',
    'Full widget customization',
    'Custom domain',
    'Priority support',
    'SLA guarantee',
  ],
}

export default function Billing() {
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const res = await api.get('/api/billing/plans/')
      return res.data
    },
  })

  const { data: subscription, isLoading: subLoading, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: async () => {
      const res = await api.get('/api/billing/subscription/')
      return res.data
    },
  })

  const subscribeMutation = useMutation({
    mutationFn: (planId) => api.post('/api/billing/subscribe/', { plan_id: planId }),
    onSuccess: (res) => {
      window.location.href = res.data.checkout_url
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Checkout failed'),
  })

  const portalMutation = useMutation({
    mutationFn: () => api.post('/api/billing/portal/'),
    onSuccess: (res) => {
      window.open(res.data.portal_url, '_blank')
    },
    onError: () => toast.error('Could not open billing portal'),
  })

  const currentPlanName = subscription?.plan?.name || 'free'

  const formatRequests = (n) => n === -1 ? 'Unlimited' : n?.toLocaleString()

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing</h1>
          <p className="text-gray-500 mt-1">Manage your subscription and plan</p>
        </div>
        {subscription?.stripe_customer_id && (
          <button
            onClick={() => portalMutation.mutate()}
            disabled={portalMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <CreditCard size={16} />
            Manage Billing
            <ExternalLink size={14} />
          </button>
        )}
      </div>

      {/* Current plan status */}
      {!subLoading && subscription && (
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Plan</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5 capitalize">
                {subscription.plan?.display_name}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {subscription.requests_this_month?.toLocaleString()} /{' '}
                {formatRequests(subscription.plan?.max_requests_per_month)} requests this month
              </p>
            </div>
            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                ${subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                  subscription.status === 'past_due' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'}`}>
                {subscription.status}
              </span>
              {subscription.current_period_end && (
                <p className="text-xs text-gray-400 mt-1">
                  Renews {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Usage bar */}
          {subscription.plan?.max_requests_per_month !== -1 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Requests used</span>
                <span>{subscription.requests_this_month} / {subscription.plan?.max_requests_per_month}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (subscription.requests_this_month / subscription.plan?.max_requests_per_month) * 100)}%`
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Plan cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Plans</h2>
      {plansLoading ? (
        <div className="text-gray-400 py-8 text-center">Loading plans...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlanName
            const features = PLAN_FEATURES[plan.name] || []
            const isPro = plan.name === 'pro'

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col
                  ${isPro ? 'border-primary-500 shadow-lg' : 'border-gray-200'}
                  ${isCurrentPlan ? 'bg-primary-50' : 'bg-white'}`}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                      <Zap size={12} /> Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 text-lg">{plan.display_name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${Number(plan.price_monthly) === 0 ? '0' : plan.price_monthly}
                    </span>
                    <span className="text-gray-400 text-sm">/month</span>
                  </div>
                  {plan.description && (
                    <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  )}
                </div>

                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={15} className="text-green-500 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                    Current Plan
                  </button>
                ) : plan.name === 'free' ? (
                  <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                    Free Tier
                  </button>
                ) : (
                  <button
                    onClick={() => subscribeMutation.mutate(plan.id)}
                    disabled={subscribeMutation.isPending}
                    className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                      ${isPro
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      } disabled:opacity-50`}
                  >
                    {subscribeMutation.isPending ? 'Loading...' : `Upgrade to ${plan.display_name}`}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}
