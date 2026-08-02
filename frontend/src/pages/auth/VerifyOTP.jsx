import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function VerifyOTP() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const email = state?.email

  const handleVerify = async () => {
    if (!otp || otp.length !== 4) return toast.error('Enter 4-digit OTP')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/verify_otp/', { email, otp })
      setAuth(res.data.user, res.data.tokens.access, res.data.tokens.refresh)
      toast.success('Account verified!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/api/auth/resend_otp/', { email })
      toast.success('New OTP sent!')
    } catch {
      toast.error('Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-4xl mb-4">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
          <p className="text-gray-500 text-sm mb-8">
            We sent a 4-digit code to <strong>{email}</strong>
          </p>
          <div className="flex flex-col gap-4">
            <Input
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={4}
              className="text-center text-2xl tracking-widest"
            />
            <Button onClick={handleVerify} loading={loading} fullWidth>Verify Account</Button>
            <button onClick={handleResend} className="text-sm text-primary-600 hover:underline">
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}