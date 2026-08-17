import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Key, MessageSquare, Settings, LogOut, CreditCard, Palette } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import api from '../../lib/axios'
import toast from 'react-hot-toast'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/documents',  icon: FileText,        label: 'Documents' },
  { to: '/api-keys',   icon: Key,             label: 'API Keys' },
  { to: '/chat',       icon: MessageSquare,   label: 'Chat' },
  { to: '/widget',     icon: Palette,         label: 'Widget' },
  { to: '/billing',    icon: CreditCard,      label: 'Billing' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]


export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await api.post('/api/auth/logout/', { refresh })
    } catch {}
    logout()
    navigate('/login')
    toast.success('Logged out')
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-primary-600">ChatSaaS</h1>
        <p className="text-xs text-gray-400 mt-1">{user?.company_name || user?.email}</p>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
              ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {user?.first_name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  )
}