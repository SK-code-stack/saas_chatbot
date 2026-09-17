import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
    toast.success('Password reset instructions sent to your email!')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200 items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white dark:bg-[#171f33]/90 border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#38bdf8]/20 border border-[#38bdf8]/30 mx-auto flex items-center justify-center text-[#38bdf8]">
            <span className="material-symbols-outlined text-[24px]">lock_reset</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reset Your Password</h1>
          <p className="text-xs text-slate-500 dark:text-[#908fa0]">Enter your registered account email to receive reset instructions</p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Work Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-sm px-4 py-2.5 rounded-xl border border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] font-semibold text-sm text-white shadow-lg transition-all"
            >
              Send Reset Instructions
            </button>
          </form>
        ) : (
          <div className="p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-xl text-center space-y-2">
            <span className="material-symbols-outlined text-[#10b981] text-[32px]">mark_email_read</span>
            <p className="text-sm font-semibold text-white">Reset Link Sent!</p>
            <p className="text-xs text-slate-600 dark:text-[#c7c4d7]">Check your inbox at <span className="font-mono text-white">{email}</span> for next steps.</p>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="text-xs text-[#38bdf8] font-semibold hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
