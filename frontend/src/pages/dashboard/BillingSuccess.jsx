import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function BillingSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Auto-redirect to billing after 5 seconds
    const t = setTimeout(() => navigate('/billing'), 5000)
    return () => clearTimeout(t)
  }, [navigate])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-500 mb-6">
            Your subscription has been activated. You now have access to all Pro features.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to billing in 5 seconds...
          </p>
          <button
            onClick={() => navigate('/billing')}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
          >
            Go to Billing
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
