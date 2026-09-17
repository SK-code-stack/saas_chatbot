import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function StepBanner({ stepNumber, totalSteps = 3, title, description, nextPath, nextText, skipPath, skipText, isOptional = false }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gradient-to-r from-indigo-500/10 via-sky-500/10 to-emerald-500/10 border border-indigo-500/20 dark:border-indigo-500/30 rounded-2xl p-4 md:p-6 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/30">
          {stepNumber}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
              Step {stepNumber} of {totalSteps}
            </span>
            {isOptional && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                Optional
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Easy Setup Guide</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</h2>
          <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">{description}</p>
        </div>
      </div>

      {(nextPath || skipPath) && (
        <div className="flex flex-col sm:flex-row gap-2 shrink-0 self-start md:self-center">
          {skipPath && (
            <button
              onClick={() => navigate(skipPath)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-[#222a3d] hover:bg-slate-300 dark:hover:bg-[#31394d] text-slate-600 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-[#2d3449]"
            >
              <span>{skipText || 'Skip This Step'}</span>
              <span className="material-symbols-outlined text-[18px]">skip_next</span>
            </button>
          )}
          {nextPath && (
            <button
              onClick={() => navigate(nextPath)}
              className="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{nextText || 'Next Step'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
