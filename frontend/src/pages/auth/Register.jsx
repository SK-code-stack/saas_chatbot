import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'

export default function Register() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '',
    username: '', company_name: '', role: 'business',
    password: '', confirm_password: ''
  })

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm_password) return toast.error("Passwords don't match")
    setLoading(true)
    try {
      await api.post('/api/auth/register/', form)
      toast.success('OTP sent to your email!')
      navigate('/verify-otp', { state: { email: form.email } })
    } catch (err) {
      const errors = err.response?.data
      const msg = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Registration failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
            <p className="text-gray-500 mt-1 text-sm">Start building your AI chatbot today</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input label="First Name" value={form.first_name} onChange={set('first_name')} />
              <Input label="Last Name" value={form.last_name} onChange={set('last_name')} />
            </div>
            <Input label="Email" type="email" value={form.email} onChange={set('email')} />
            <Input label="Username" value={form.username} onChange={set('username')} />
            <Input label="Company Name (optional)" value={form.company_name} onChange={set('company_name')} />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">I am a...</label>
              <select
                value={form.role}
                onChange={set('role')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
              >
                <option value="business">Business (I want a chatbot widget)</option>
                <option value="developer">Developer (I want the API)</option>
              </select>
            </div>

            <Input label="Password" type="password" value={form.password} onChange={set('password')} />
            <Input label="Confirm Password" type="password" value={form.confirm_password} onChange={set('confirm_password')} />

            <Button type="submit" loading={loading} fullWidth>Create Account</Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}