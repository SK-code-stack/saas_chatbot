import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function VerifyOTP() {
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || 'your email'
  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)

  const { verifyOTP, resendOTP } = useAuthStore()
  const navigate = useNavigate()

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const updated = [...otp]
    updated[idx] = val.slice(-1)
    setOtp(updated)

    // Auto-focus next input
    if (val && idx < 3) {
      const nextInput = document.getElementById(`otp-${idx + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 4) {
      toast.error('Please enter the complete 4-digit OTP')
      return
    }

    setLoading(true)
    try {
      await verifyOTP(email, code)
      toast.success('Account verified & logged in successfully!')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Invalid or expired OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await resendOTP(email)
      toast.success('A new 4-digit OTP has been sent to your email!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to resend OTP')
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-[#171f33]/90 border border-[#2d3449] rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#10b981]/20 border border-[#10b981]/30 mx-auto flex items-center justify-center text-[#10b981]">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security Verification</h1>
          <p className="text-xs text-[#908fa0]">We sent a 4-digit code to <span className="text-white font-mono">{email}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-${idx}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, idx)}
                className="w-14 h-16 bg-[#131b2e] border border-[#2d3449] focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 rounded-xl text-center font-mono font-bold text-2xl text-white outline-none"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] font-semibold text-sm text-white shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all"
          >
            {loading ? 'Verifying...' : 'Verify Code & Activate'}
          </button>
        </form>

        <div className="text-center space-y-2 text-xs text-[#908fa0]">
          <p>Didn't receive the code?{' '}
            <button type="button" onClick={handleResend} className="text-[#38bdf8] font-semibold hover:underline">
              Resend code
            </button>
          </p>
          <Link to="/login" className="block text-[#908fa0] hover:text-white pt-2">← Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}