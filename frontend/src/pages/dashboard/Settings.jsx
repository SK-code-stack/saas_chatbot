import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function Settings() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    company_name: user?.company_name || '',
  })

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  })

  const profileMutation = useMutation({
    mutationFn: (data) => api.patch('/api/auth/profile/', data),
    onSuccess: (res) => {
      setUser(res.data)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Failed to update profile'),
  })

  const passwordMutation = useMutation({
    mutationFn: (data) => api.post('/api/auth/change_password/', data),
    onSuccess: () => {
      toast.success('Password changed!')
      setPasswords({ current_password: '', new_password: '', confirm_password: '' })
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to change password'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.post('/api/auth/delete_account/'),
    onSuccess: () => {
      logout()
      navigate('/login')
      toast.success('Account deleted')
    },
    onError: () => toast.error('Failed to delete account'),
  })

  const tabs = [
    { id: 'profile',  label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'danger',   label: 'Danger Zone' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              } ${tab.id === 'danger' && activeTab === tab.id ? 'text-red-600' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card title="Profile Information" className="max-w-lg">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
              />
              <Input
                label="Last Name"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
              />
            </div>
            <Input
              label="Company Name"
              value={profile.company_name}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400">Email cannot be changed</p>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Account Type</label>
              <p className="text-sm text-gray-500 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 capitalize">
                {user?.role}
              </p>
            </div>
            <Button
              onClick={() => profileMutation.mutate(profile)}
              loading={profileMutation.isPending}
            >
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card title="Change Password" className="max-w-lg">
          <div className="flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current_password}
              onChange={(e) => setPasswords({ ...passwords, current_password: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.new_password}
              onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm_password}
              onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
            />
            <Button
              onClick={() => passwordMutation.mutate(passwords)}
              loading={passwordMutation.isPending}
            >
              Update Password
            </Button>
          </div>
        </Card>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <Card className="max-w-lg border-red-200">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-red-600">Delete Account</h3>
              <p className="text-sm text-gray-500 mt-1">
                This permanently deletes your account, all documents, API keys, and chat history.
                This action cannot be undone.
              </p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure? This cannot be undone.')) {
                  deleteMutation.mutate()
                }
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50 w-fit"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete My Account'}
            </button>
          </div>
        </Card>
      )}
    </DashboardLayout>
  )
}
