import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const navItems = [
    { name: 'Overview', path: '/dashboard', icon: 'dashboard' },
    { name: 'Knowledge Base', path: '/documents', icon: 'database', badge: 'RAG v4' },
    { name: 'Widget Studio', path: '/widget', icon: 'tune' },
    { name: 'Chat Logs', path: '/chat', icon: 'forum' },
    { name: 'Developer API', path: '/api-keys', icon: 'key' },
    { name: 'Billing & Stripe', path: '/billing', icon: 'payments' },
    { name: 'Settings', path: '/settings', icon: 'settings' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#131b2e] border-r border-[#2d3449]">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#2d3449]">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6366f1] to-[#38bdf8] flex items-center justify-center font-bold text-white shadow-lg shadow-[#6366f1]/20">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div>
            <span className="font-bold text-lg text-[#dae2fd] tracking-tight block leading-none">Chatti AI</span>
            <span className="text-[10px] text-[#10b981] font-mono tracking-wider uppercase">Platform v4.2</span>
          </div>
        </NavLink>
        {setMobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[#c7c4d7] hover:text-white p-1 rounded-lg"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#908fa0]">
          Main Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen && setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#6366f1] text-white shadow-md shadow-[#6366f1]/25 font-semibold'
                  : 'text-[#c7c4d7] hover:bg-[#222a3d] hover:text-white'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium rounded-full bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-[#2d3449] bg-[#0b1326]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#10b981] flex items-center justify-center text-white font-bold text-sm shrink-0">
              {user?.email ? user.email[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#dae2fd] truncate">
                {user?.first_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-[11px] text-[#908fa0] truncate font-mono">
                {user?.email || 'pro_workspace'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 text-[#908fa0] hover:text-red-400 hover:bg-[#222a3d] rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}