import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)  // 1 = email, 2 = OTP + new password
  const [email, setEmail] = useState('')
  const [form, setForm] = useState({ otp_code: '', new_password: '', confirm_password: '' })
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSendOTP = async (e) => {
    e.preventDefault()
    if (!email.trim()) return toast.error('Email is required')
    setLoading(true)
    try {
      await api.post('/api/auth/forgot_password/', { email })
      toast.success('OTP sent! Check your email.')
      setStep(2)
    } catch (err) {
      // Show success even on error to not reveal if email exists
      toast.success('If this email exists, an OTP has been sent.')
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (form.new_password !== form.confirm_password) {
      return toast.error("Passwords don't match")
    }
    setLoading(true)
    try {
      await api.post('/api/auth/reset_password/', {
        email,
        otp_code: form.otp_code,
        new_password: form.new_password,
        confirm_password: form.confirm_password,
      })
      toast.success('Password reset successfully!')
      navigate('/login')
    } catch (err) {
      const msg = err.response?.data?.error || 'Reset failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {step === 1 ? (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Forgot Password</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Enter your email and we'll send you a reset code.
                </p>
              </div>
              <form onSubmit={handleSendOTP} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" loading={loading} fullWidth>
                  Send Reset Code
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                <p className="text-gray-500 mt-1 text-sm">
                  Enter the code sent to <strong>{email}</strong>
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <Input
                  label="OTP Code"
                  placeholder="4-digit code"
                  value={form.otp_code}
                  onChange={set('otp_code')}
                  maxLength={4}
                />
                <Input
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.new_password}
                  onChange={set('new_password')}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={set('confirm_password')}
                />
                <Button type="submit" loading={loading} fullWidth>
                  Reset Password
                </Button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm text-primary-600 hover:underline text-center"
                >
                  ← Back to email
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
