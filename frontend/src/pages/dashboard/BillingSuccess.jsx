import React from 'react'
import { Link } from 'react-router-dom'

export default function BillingSuccess() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200 items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-96 h-96 bg-[#10b981]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white dark:bg-[#171f33]/90 border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border border-[#10b981]/30 mx-auto flex items-center justify-center text-[#10b981] animate-bounce">
          <span className="material-symbols-outlined text-[36px]">check_circle</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Payment Successful!</h1>
          <p className="text-xs text-slate-600 dark:text-[#c7c4d7]">Your plan has been upgraded to <span className="text-[#38bdf8] font-bold">Pro Scale ($99/mo)</span></p>
        </div>

        <div className="bg-slate-50 dark:bg-[#131b2e] border border-slate-200 dark:border-[#2d3449] rounded-xl p-4 text-xs space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-[#908fa0]">Billing Status:</span>
            <span className="text-[#10b981] font-mono font-bold">Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-[#908fa0]">Next Renewal:</span>
            <span className="text-white font-mono">Oct 15, 2026</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <Link
            to="/widget"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs sm:text-sm block shadow-lg shadow-[#6366f1]/25 hover:opacity-95"
          >
            Customize Chat Widget →
          </Link>
          <Link
            to="/dashboard"
            className="w-full py-3 rounded-xl bg-slate-200 dark:bg-[#222a3d] text-slate-900 dark:text-white font-semibold text-xs sm:text-sm block hover:bg-[#31394d]"
          >
            Go to Dashboard Overview
          </Link>
        </div>
      </div>
    </div>
  )
}
