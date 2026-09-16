import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b1326]/80 backdrop-blur-xl border-b border-[#2d3449]/50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6366f1] via-[#38bdf8] to-[#10b981] p-0.5 shadow-lg shadow-[#6366f1]/25">
            <div className="w-full h-full bg-[#0b1326] rounded-[14px] flex items-center justify-center">
              <span className="material-symbols-outlined text-[#38bdf8] text-[22px]">smart_toy</span>
            </div>
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight block">Chatti AI</span>
            <span className="text-[10px] text-[#38bdf8] font-mono tracking-widest uppercase">Enterprise RAG</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">Features</a>
          <a href="#solutions" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">Solutions</a>
          <a href="#pricing" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">Pricing</a>
          <a href="#api" className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors">Developer API</a>
        </nav>

        {/* Desktop Right CTAs */}
        <div className="hidden lg:flex items-center gap-4">
          {isAuthenticated ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all"
            >
              Go to Dashboard →
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[#c7c4d7] hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register?role=business"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs md:text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">domain</span>
                <span>Get Started (Business)</span>
              </Link>
              <Link
                to="/login?role=developer"
                className="px-4 py-2.5 rounded-xl bg-[#171f33] border border-[#2d3449] text-[#dae2fd] hover:text-white font-semibold text-xs md:text-sm hover:bg-[#222a3d] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
                <span>Developer Portal</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#c7c4d7] hover:text-white rounded-xl hover:bg-[#171f33]"
        >
          <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#131b2e] border-b border-[#2d3449] px-6 py-6 space-y-4">
          <nav className="flex flex-col space-y-3">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#c7c4d7]">Features</a>
            <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#c7c4d7]">Solutions</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#c7c4d7]">Pricing</a>
            <a href="#api" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-[#c7c4d7]">Developer API</a>
          </nav>
          <div className="pt-4 border-t border-[#2d3449] flex flex-col gap-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#171f33] text-white font-semibold text-sm"
            >
              Sign In
            </Link>
            <Link
              to="/register?role=business"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-sm shadow-md"
            >
              Get Started as Business Owner
            </Link>
            <Link
              to="/login?role=developer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-xl bg-[#222a3d] border border-[#2d3449] text-[#38bdf8] font-semibold text-sm"
            >
              Developer Login
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
