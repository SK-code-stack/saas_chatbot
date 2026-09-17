import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Register() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'developer' ? 'developer' : 'business'
  const [role, setRole] = useState(defaultRole)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const { register: registerUser } = useAuthStore()
  const navigate = useNavigate()

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { label: 'None', width: '0%', color: 'bg-gray-600' }
    if (pass.length < 8) return { label: 'Too short (<8 chars)', width: '25%', color: 'bg-red-500' }
    const hasUpper = /[A-Z]/.test(pass)
    const hasLower = /[a-z]/.test(pass)
    const hasNum = /\d/.test(pass)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    const score = [hasUpper, hasLower, hasNum, hasSpecial].filter(Boolean).length

    if (score <= 2) return { label: 'Weak (add A-Z, 0-9, special char)', width: '40%', color: 'bg-yellow-500' }
    if (score === 3) return { label: 'Good', width: '75%', color: 'bg-emerald-400' }
    return { label: 'Strong', width: '100%', color: 'bg-[#10b981]' }
  }

  const strength = calculatePasswordStrength(formData.password)

  const parseErrorMessage = (err) => {
    if (!err.response?.data) return 'Registration failed. Please check details.'
    const data = err.response.data
    if (typeof data === 'string') return data
    if (data.detail) return data.detail

    // Parse field-specific errors
    const messages = []
    Object.keys(data).forEach((field) => {
      const val = data[field]
      if (Array.isArray(val)) {
        messages.push(`${field}: ${val.join(' ')}`)
      } else if (typeof val === 'string') {
        messages.push(`${field}: ${val}`)
      }
    })
    return messages.length > 0 ? messages.join('\n') : 'Registration failed'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields')
      return
    }

    // Auto-generate username from email
    const emailPrefix = formData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
    const autoUsername = `${emailPrefix}_${Math.floor(1000 + Math.random() * 9000)}`

    setLoading(true)
    try {
      await registerUser({
        username: autoUsername,
        first_name: formData.name.split(' ')[0] || formData.name,
        last_name: formData.name.split(' ').slice(1).join(' ') || 'User',
        email: formData.email,
        password: formData.password,
        confirm_password: formData.password,
        role: role,
        company_name: formData.company || 'Personal Workspace',
      })
      toast.success('Registration successful! OTP sent to your email.')
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`)
    } catch (err) {
      console.error(err)
      toast.error(parseErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200 items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#10b981]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg bg-white dark:bg-[#171f33]/90 border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#38bdf8] flex items-center justify-center text-white font-bold text-lg shadow-lg">
              AI
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create your Chatti AI Account</h1>
          <p className="text-xs text-slate-500 dark:text-[#908fa0]">Get started with RAG vector knowledge models</p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              role === 'business'
                ? 'bg-[#6366f1]/15 border-[#6366f1] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#6366f1]">domain</span>
              {role === 'business' && <span className="w-2 h-2 rounded-full bg-[#6366f1]" />}
            </div>
            <p className="text-xs font-bold text-white mt-2">Business Owner</p>
            <p className="text-[10px] text-slate-500 dark:text-[#908fa0] mt-0.5">Widget studio & lead analytics</p>
          </button>

          <button
            type="button"
            onClick={() => setRole('developer')}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              role === 'developer'
                ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-white shadow-md'
                : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-[#38bdf8]">code</span>
              {role === 'developer' && <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />}
            </div>
            <p className="text-xs font-bold text-white mt-2">Developer</p>
            <p className="text-[10px] text-slate-500 dark:text-[#908fa0] mt-0.5">REST API, Webhooks & SDKs</p>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Company / App Name</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Acme Corp"
                className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Work Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane@company.com"
              className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Password</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="e.g. Password123!"
              className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
            />
            <p className="text-[11px] text-slate-500 dark:text-[#908fa0]">Must be 8+ chars with uppercase, lowercase, number & special char (!@#$)</p>
            {formData.password && (
              <div className="space-y-1 pt-1">
                <div className="h-1.5 w-full bg-slate-200 dark:bg-[#131b2e] rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }} />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-[#908fa0] text-right font-mono">{strength.label}</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#908fa0]">
            <input type="checkbox" required id="tos" className="rounded bg-slate-100 dark:bg-[#131b2e] border-slate-300 dark:border-[#2d3449] text-[#6366f1]" />
            <label htmlFor="tos">
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] font-semibold text-sm text-white shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Creating account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 dark:text-[#908fa0]">
          Already have an account?{' '}
          <Link to={`/login?role=${role}`} className="text-[#38bdf8] font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}