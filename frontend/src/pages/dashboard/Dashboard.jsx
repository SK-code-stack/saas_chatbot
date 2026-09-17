import React, { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

export default function Dashboard() {
  const [mobileOpen, setMobileOpen] = useState(false)

  // Sample Recharts Data
  const messageData = [
    { time: '00:00', messages: 420, resolution: 98 },
    { time: '04:00', messages: 180, resolution: 96 },
    { time: '08:00', messages: 890, resolution: 99 },
    { time: '12:00', messages: 1450, resolution: 97 },
    { time: '16:00', messages: 1820, resolution: 98 },
    { time: '20:00', messages: 950, resolution: 96 },
    { time: '23:59', messages: 610, resolution: 99 },
  ]

  const intentData = [
    { name: 'Product Pricing', value: 42, color: '#6366f1' },
    { name: 'API & Integration', value: 28, color: '#38bdf8' },
    { name: 'Account & Billing', value: 18, color: '#10b981' },
    { name: 'Technical Support', value: 12, color: '#f59e0b' },
  ]

  const recentConversations = [
    { id: 'SESS-8492', user: 'alex.m@acme.io', topic: 'Webhook HMAC Signature Validation', score: '99.4%', time: '2 mins ago', status: 'Resolved' },
    { id: 'SESS-8491', user: 'sarah.k@fintech.co', topic: 'Stripe Plan Upgrade Inquiry', score: '98.1%', time: '14 mins ago', status: 'Resolved' },
    { id: 'SESS-8490', user: 'dev_user99', topic: 'Vector DB Indexing Latency', score: '95.2%', time: '35 mins ago', status: 'Escalated' },
    { id: 'SESS-8489', user: 'growth@shop.net', topic: 'Widget Custom Color Setup', score: '99.8%', time: '1 hr ago', status: 'Resolved' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Executive Dashboard" />

        <main className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto">

          {/* 3-Step Getting Started Guide */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">🚀 Your 3-Step Setup Guide</h2>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Follow these steps to get your AI chatbot live on your website</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  step: 1,
                  title: 'Upload Documents',
                  desc: 'Add your PDFs, Word docs, or URLs — your chatbot learns from these.',
                  icon: 'database',
                  color: '#6366f1',
                  path: '/documents',
                  label: 'Go to Knowledge Base',
                },
                {
                  step: 2,
                  title: 'Create Your Chatbot',
                  desc: 'Name your chatbot and pick which documents it should answer questions from.',
                  icon: 'smart_toy',
                  color: '#38bdf8',
                  path: '/chatbots',
                  label: 'Create Chatbot',
                },
                {
                  step: 3,
                  title: 'Customize & Deploy',
                  desc: 'Choose colors, icon and name. Then copy the 1-line embed code for your website.',
                  icon: 'tune',
                  color: '#10b981',
                  path: '/widget',
                  label: 'Customize & Get Code',
                },
              ].map(({ step, title, desc, icon, color, path, label, optional }) => (
                <a
                  key={step}
                  href={path}
                  className="block p-5 rounded-2xl border border-slate-200 dark:border-[#2d3449] hover:border-[#6366f1]/50 bg-slate-50 dark:bg-[#131b2e] hover:bg-white dark:hover:bg-[#1a2240] transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                      style={{ backgroundColor: color + '22', border: `1px solid ${color}40` }}
                    >
                      <span className="material-symbols-outlined text-[22px]" style={{ color }}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: color + '22', color }}>
                          Step {step}
                        </span>
                        {optional && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                            Optional
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
                      <p className="text-xs text-slate-500 dark:text-[#908fa0] mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
                    <span>{label}</span>
                    <span className="material-symbols-outlined text-[15px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Metric 1 */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-[#6366f1]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-[#908fa0]">Active Chatbots</span>
                <div className="w-8 h-8 rounded-lg bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1]">
                  <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-white">4 Active</span>
                <span className="text-xs font-medium text-[#10b981] flex items-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +12%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#908fa0]">Across production environments</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-[#38bdf8]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-[#908fa0]">Total Messages</span>
                <div className="w-8 h-8 rounded-lg bg-[#38bdf8]/20 flex items-center justify-center text-[#38bdf8]">
                  <span className="material-symbols-outlined text-[18px]">forum</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-white">128,450</span>
                <span className="text-xs font-medium text-[#10b981] flex items-center">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +24%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#908fa0]">This monthly billing cycle</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-[#10b981]/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-[#908fa0]">Knowledge Docs</span>
                <div className="w-8 h-8 rounded-lg bg-[#10b981]/20 flex items-center justify-center text-[#10b981]">
                  <span className="material-symbols-outlined text-[18px]">database</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-white">1,420 Files</span>
                <span className="text-xs font-mono font-medium text-[#10b981]">Ready</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#908fa0]">Vector embeddings synchronized</p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-3 relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500 dark:text-[#908fa0]">API Rate Limit Usage</span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <span className="material-symbols-outlined text-[18px]">speed</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-white">84.2%</span>
                <span className="text-xs font-mono font-medium text-amber-400">Warning</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-[#131b2e] h-2 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full w-[84%]" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Area Chart (8 Cols) */}
            <div className="lg:col-span-8 bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#2d3449] pb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Message Volume & RAG Resolution Speed</h2>
                  <p className="text-xs text-slate-500 dark:text-[#908fa0]">Real-time AI query resolution breakdown over 24 hours</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#6366f1]" />
                  <span className="text-xs text-slate-600 dark:text-[#c7c4d7]">Queries</span>
                </div>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={messageData}>
                    <defs>
                      <linearGradient id="colorMsg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#908fa0" fontSize={11} tickLine={false} />
                    <YAxis stroke="#908fa0" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2d3449', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="messages" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorMsg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Donut Intent Distribution Chart (4 Cols) */}
            <div className="lg:col-span-4 bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
              <div className="border-b border-slate-200 dark:border-[#2d3449] pb-3">
                <h2 className="text-base font-bold text-white">Customer Intent Distribution</h2>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Top query topics categorized by RAG engine</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={intentData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                      {intentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#131b2e', borderColor: '#2d3449', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-[#2d3449]">
                {intentData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">{item.name}</span>
                    </div>
                    <span className="font-mono text-white font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Conversations Table */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Live Conversation Stream</h2>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Recent interactions handled by the AI support agent</p>
              </div>
              <button className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1">
                View All Logs <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 dark:text-[#908fa0] uppercase tracking-wider font-mono border-b border-slate-200 dark:border-slate-200 dark:border-[#2d3449]/50">
                    <th className="pb-3 font-medium">Session ID</th>
                    <th className="pb-3 font-medium">User Email</th>
                    <th className="pb-3 font-medium">Topic / Query Summary</th>
                    <th className="pb-3 font-medium">RAG Confidence</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-100 dark:divide-[#2d3449]/30 text-[#dae2fd]">
                  {recentConversations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-[#222a3d]/40 transition-colors">
                      <td className="py-3.5 font-mono text-[#38bdf8]">{row.id}</td>
                      <td className="py-3.5 font-medium">{row.user}</td>
                      <td className="py-3.5 text-slate-600 dark:text-[#c7c4d7]">{row.topic}</td>
                      <td className="py-3.5 font-mono text-[#10b981]">{row.score}</td>
                      <td className="py-3.5 text-slate-500 dark:text-[#908fa0]">{row.time}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-medium ${row.status === 'Resolved'
                            ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}