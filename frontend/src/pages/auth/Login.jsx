import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

export default function Login() {
  const [searchParams] = useSearchParams()
  const defaultRole = searchParams.get('role') === 'developer' ? 'developer' : 'business'
  const [role, setRole] = useState(defaultRole)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please enter both email and password')
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      toast.success('Successfully logged in!')
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      const msg = err.response?.data?.detail || err.response?.data?.error || 'Invalid email or password'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200 items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#6366f1]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#38bdf8]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#171f33]/90 border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#38bdf8] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#6366f1]/25">
              AI
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white tracking-tight">Sign In to Chatti AI</h1>
          <p className="text-xs text-slate-500 dark:text-[#908fa0]">Access your AI chatbot workspace & developer hub</p>
        </div>

        {/* Dual Role Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#131b2e] p-1.5 rounded-xl border border-slate-200 dark:border-[#2d3449]">
          <button
            type="button"
            onClick={() => setRole('business')}
            className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              role === 'business'
                ? 'bg-[#6366f1] text-white shadow-md font-semibold'
                : 'text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">domain</span>
            <span>Business Owner</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('developer')}
            className={`py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
              role === 'developer'
                ? 'bg-[#38bdf8] text-[#00354a] shadow-md font-semibold'
                : 'text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            <span>Developer</span>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">
              {role === 'developer' ? 'Developer Email' : 'Business Email'}
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 dark:text-[#908fa0] text-[18px]">mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#2d3449] focus:outline-none focus:border-[#6366f1] placeholder-slate-400 dark:placeholder-[#908fa0]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-600 dark:text-[#c7c4d7]">Password</label>
              <Link to="/forgot-password" className="text-xs text-[#38bdf8] hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-3 text-slate-400 dark:text-[#908fa0] text-[18px]">lock</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-sm pl-10 pr-10 py-2.5 rounded-xl border border-[#2d3449] focus:outline-none focus:border-[#6366f1] placeholder-slate-400 dark:placeholder-[#908fa0]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-[#908fa0]">
            <input type="checkbox" id="remember" className="rounded bg-slate-100 dark:bg-[#131b2e] border-slate-300 dark:border-[#2d3449] text-[#6366f1]" />
            <label htmlFor="remember">Remember me on this device</label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              role === 'developer'
                ? 'bg-gradient-to-r from-[#38bdf8] to-[#6366f1] text-[#00354a]'
                : 'bg-gradient-to-r from-[#6366f1] to-[#38bdf8]'
            } ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-95'}`}
          >
            {loading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <span>Sign In as {role === 'developer' ? 'Developer' : 'Business Owner'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-slate-200 dark:border-[#2d3449] w-full" />
          <span className="bg-[#171f33] px-3 text-[11px] text-slate-500 dark:text-[#908fa0] uppercase tracking-wider font-mono absolute">
            Or continue with
          </span>
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-2 gap-3">
          <button className="py-2.5 px-4 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-[#2d3449] hover:bg-[#222a3d] text-xs font-medium text-white rounded-xl flex items-center justify-center gap-2 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.30s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.4 0 15.3c0 2.9.7 5.6 1.9 8l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
            </svg>
            <span>Google</span>
          </button>

          <button className="py-2.5 px-4 bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-[#2d3449] hover:bg-[#222a3d] text-xs font-medium text-white rounded-xl flex items-center justify-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">terminal</span>
            <span>GitHub</span>
          </button>
        </div>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-[#908fa0]">
          Don't have an account?{' '}
          <Link to={`/register?role=${role}`} className="text-[#38bdf8] font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  )
}