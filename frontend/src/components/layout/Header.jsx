import React from 'react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

export default function Header({ setMobileOpen, pageTitle = 'Dashboard' }) {
  const { user } = useAuthStore()
  const { isDark, toggle } = useThemeStore()

  return (
    <header className="h-16 bg-white/80 dark:bg-[#131b2e]/80 backdrop-blur-xl border-b border-slate-200 dark:border-[#2d3449] sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen && setMobileOpen(true)}
          className="md:hidden text-slate-500 dark:text-[#c7c4d7] hover:text-slate-900 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#222a3d] transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-xl text-xs font-medium text-slate-700 dark:text-[#dae2fd]">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>Chatti AI</span>
          <span className="material-symbols-outlined text-[16px] text-slate-400 dark:text-[#908fa0]">unfold_more</span>
        </div>

        <h1 className="text-base md:text-lg font-bold text-slate-800 dark:text-[#dae2fd] tracking-tight sm:border-l sm:border-slate-200 dark:sm:border-[#2d3449] sm:pl-4">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Search, Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] px-3.5 py-1.5 rounded-xl text-xs text-slate-400 dark:text-[#908fa0] w-52 focus-within:border-[#6366f1] transition-all">
          <span className="material-symbols-outlined text-[18px]">search</span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-xs w-full text-slate-700 dark:text-[#dae2fd] placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-[#908fa0]"
          />
        </div>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={toggle}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-xl text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#222a3d] border border-slate-200 dark:border-[#2d3449] transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">
            {isDark ? 'light_mode' : 'dark_mode'}
          </span>
        </button>

        {/* System Health Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 bg-[#10b981]/10 border border-[#10b981]/20 rounded-full text-[11px] font-mono font-medium text-[#10b981]">
          <span className="material-symbols-outlined text-[14px]">bolt</span>
          <span>Online</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 text-slate-500 dark:text-[#c7c4d7] hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-[#222a3d] transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#6366f1] rounded-full ring-2 ring-white dark:ring-[#131b2e]"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-[#2d3449]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8] flex items-center justify-center text-white text-xs font-bold shadow-md shadow-[#6366f1]/20">
            {user?.email ? user.email[0].toUpperCase() : 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
