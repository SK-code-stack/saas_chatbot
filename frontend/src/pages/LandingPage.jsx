import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'

export default function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [testQuestion, setTestQuestion] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'user',
      text: 'How do I configure custom webhooks for real-time ticket escalation?',
    },
    {
      sender: 'ai',
      text: "You can set up webhooks via our Developer Dashboard or by passing the endpoint config in your API payload. Here's a quick vector-cited snippet from our docs:",
      code: 'POST /api/v1/webhooks\n{ "url": "https://yourdomain.com/webhook", "events": ["escalation.created"] }',
      citation: 'docs/api-reference/webhooks.md (Similarity: 98.4%)',
    },
  ])

  const handleSendTestMessage = (e) => {
    e.preventDefault()
    if (!testQuestion.trim()) return

    const userText = testQuestion
    setTestQuestion('')
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }])

    // Simulate AI response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Here is the information regarding "${userText}" generated using your vectorized RAG pipeline context:`,
          code: '// Live Vector Match Demo\n{\n  "status": "success",\n  "answer": "Instant response generated from knowledge base chunk #42."\n}',
          citation: 'knowledge_base/faq_v2.pdf (Similarity: 96.1%)',
        },
      ])
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-[#dae2fd] overflow-x-hidden selection:bg-[#6366f1]/30 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto">
        <div className="absolute top-10 right-10 w-96 h-96 bg-[#6366f1]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#38bdf8]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] px-4 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs font-mono font-medium text-[#10b981] uppercase tracking-wider">
                Next-Gen RAG Engine v4.2
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
              Supercharge Support & Workflows with AI Trained on <span className="bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#10b981] bg-clip-text text-transparent">Your Data</span>
            </h1>

            <p className="text-base md:text-lg text-slate-600 dark:text-[#c7c4d7] max-w-xl leading-relaxed">
              Deploy hyper-accurate, hallucination-free AI assistants in minutes. Ingest your docs, web links, and API workflows into a unified vector knowledge matrix.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/register?role=business"
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-sm shadow-xl shadow-[#6366f1]/30 hover:opacity-95 transition-all flex items-center gap-2"
              >
                <span>Get Started as Business Owner</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
              <Link
                to="/login?role=developer"
                className="px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] text-slate-800 dark:text-white font-semibold text-sm hover:bg-slate-200 dark:hover:bg-[#222a3d] transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">code</span>
                <span>Developer API Portal</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-500 dark:text-[#908fa0]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>Deploy script tag in 3 mins</span>
              </div>
            </div>
          </div>

          {/* Hero Right: Live Interactive Widget Demo */}
          <div className="lg:col-span-6">
            <div className="bg-white dark:bg-[#171f33]/90 border border-slate-200 dark:border-[#2d3449] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col h-[520px]">
              {/* Header */}
              <div className="bg-[#222a3d] px-5 py-3.5 flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-[#6366f1]/20 flex items-center justify-center text-[#6366f1] font-bold text-sm">
                      AI
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#10b981] rounded-full ring-2 ring-[#222a3d]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">Support Assistant</h3>
                    <p className="text-[11px] text-[#10b981] font-mono">Online • Trained on 1.4k vector chunks</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-[#908fa0]">
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </div>
              </div>

              {/* Chat Container */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#0b1326]/40">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 max-w-[88%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${msg.sender === 'user' ? 'bg-slate-200 dark:bg-[#222a3d] text-slate-700 dark:text-[#c7c4d7]' : 'bg-[#6366f1] text-white'}`}>
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-200 dark:bg-[#222a3d] text-slate-900 dark:text-white rounded-tr-none'
                        : 'bg-[#6366f1]/10 border border-[#6366f1]/20 text-slate-700 dark:text-[#dae2fd] rounded-tl-none space-y-2'
                    }`}>
                      <p>{msg.text}</p>
                      {msg.code && (
                        <pre className="bg-[#060e20] p-2.5 rounded-lg text-[11px] font-mono text-[#38bdf8] overflow-x-auto">
                          {msg.code}
                        </pre>
                      )}
                      {msg.citation && (
                        <div className="flex items-center gap-1.5 pt-1 border-t border-[#6366f1]/20 text-[11px] text-[#10b981] font-mono">
                          <span className="material-symbols-outlined text-[14px]">database</span>
                          <span>Source: {msg.citation}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendTestMessage} className="p-3 bg-white dark:bg-[#171f33] border-t border-slate-200 dark:border-[#2d3449] flex items-center gap-2">
                <input
                  type="text"
                  value={testQuestion}
                  onChange={(e) => setTestQuestion(e.target.value)}
                  placeholder="Type a message to test the AI RAG engine..."
                  className="flex-1 bg-[#131b2e] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#2d3449] focus:outline-none focus:border-[#6366f1] placeholder-slate-400 dark:placeholder-[#908fa0]"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-colors flex items-center justify-center shadow-md shadow-[#6366f1]/20"
                >
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof & Metrics */}
      <section className="py-12 bg-slate-100/60 dark:bg-[#131b2e]/60 border-y border-[#2d3449]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-white">99.9%</p>
            <p className="text-xs text-slate-500 dark:text-[#908fa0] uppercase tracking-wider mt-1">Uptime SLA Guaranteed</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#38bdf8]">50M+</p>
            <p className="text-xs text-slate-500 dark:text-[#908fa0] uppercase tracking-wider mt-1">Vector Queries Processed</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#10b981]">10x</p>
            <p className="text-xs text-slate-500 dark:text-[#908fa0] uppercase tracking-wider mt-1">Faster Support Responses</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-[#6366f1]">&lt; 250ms</p>
            <p className="text-xs text-slate-500 dark:text-[#908fa0] uppercase tracking-wider mt-1">Average RAG Latency</p>
          </div>
        </div>
      </section>

      {/* Dual Role Breakdown */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Built for Business Growth & Developer Power</h2>
          <p className="text-slate-600 dark:text-[#c7c4d7] text-sm md:text-base">Whether you want a zero-code plug-and-play chat widget or raw REST API endpoints, Chatti AI provides tailored experiences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: Business Owner */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 hover:border-[#6366f1]/50 transition-all space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center text-[#6366f1]">
              <span className="material-symbols-outlined text-[28px]">domain</span>
            </div>
            <div>
              <span className="text-xs font-mono font-medium text-[#6366f1] uppercase tracking-wider">For Business Owners</span>
              <h3 className="text-2xl font-bold text-white mt-1">No-Code Chatbot Builder & Analytics</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-[#c7c4d7]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>Visual Widget Studio with live color & logo customizer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>1-Click PDF, DOCX, and Website URL knowledge indexing</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                <span>Automated lead generation forms & customer sentiment analytics</span>
              </li>
            </ul>
            <Link
              to="/register?role=business"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#6366f1] group-hover:text-white transition-colors"
            >
              <span>Get Started as Business Owner</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {/* Card 2: Developer */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 hover:border-[#38bdf8]/50 transition-all space-y-6 group">
            <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/20 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8]">
              <span className="material-symbols-outlined text-[28px]">code</span>
            </div>
            <div>
              <span className="text-xs font-mono font-medium text-[#38bdf8] uppercase tracking-wider">For Developers</span>
              <h3 className="text-2xl font-bold text-white mt-1">Developer API, Webhooks & RAG SDK</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-[#c7c4d7]">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">check_circle</span>
                <span>REST API with scoped API Keys (`sk_live_...`)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">check_circle</span>
                <span>Real-time webhook events (`message.created`, `doc.indexed`)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#38bdf8] text-[18px]">check_circle</span>
                <span>Google Tag Manager API & 1-click script tag injection</span>
              </li>
            </ul>
            <Link
              to="/login?role=developer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#38bdf8] group-hover:text-white transition-colors"
            >
              <span>Explore Developer Docs</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-100/50 dark:bg-[#131b2e]/40 border-t border-slate-200 dark:border-[#2d3449] px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, Transparent Pricing</h2>
            <p className="text-slate-600 dark:text-[#c7c4d7] text-sm md:text-base">Choose the plan that fits your business or app scale. Cancel anytime.</p>

            {/* Monthly / Yearly Toggle */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <span className={`text-sm ${!isAnnual ? 'text-white font-semibold' : 'text-slate-500 dark:text-[#908fa0]'}`}>Monthly Billing</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${isAnnual ? 'bg-[#6366f1]' : 'bg-slate-200 dark:bg-[#222a3d]'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-white font-semibold' : 'text-slate-500 dark:text-[#908fa0]'} flex items-center gap-1.5`}>
                Annual Billing
                <span className="px-2 py-0.5 text-[10px] font-mono bg-[#10b981]/20 text-[#10b981] rounded-full border border-[#10b981]/30">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Perfect for small business websites and testing.</p>
                <div className="text-3xl font-extrabold text-white">
                  ${isAnnual ? '24' : '29'} <span className="text-xs font-normal text-slate-500 dark:text-[#908fa0]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#c7c4d7] pt-4 border-t border-slate-200 dark:border-[#2d3449]">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> 5,000 Messages / mo</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> 10 Vector Knowledge Docs</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Standard Widget Customizer</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Community Support</li>
                </ul>
              </div>
              <Link to="/register?plan=starter" className="w-full py-3 text-center rounded-xl bg-slate-200 dark:bg-[#222a3d] hover:bg-slate-300 dark:hover:bg-[#31394d] text-slate-800 dark:text-white font-semibold text-xs transition-colors">
                Start 14-Day Free Trial
              </Link>
            </div>

            {/* Pro Plan (Featured) */}
            <div className="bg-white dark:bg-[#171f33] border-2 border-[#6366f1] rounded-2xl p-8 space-y-6 flex flex-col justify-between relative shadow-2xl shadow-[#6366f1]/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#6366f1] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                Most Popular
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Pro Scale</h3>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">For growing businesses requiring custom AI and Stripe billing.</p>
                <div className="text-3xl font-extrabold text-white">
                  ${isAnnual ? '79' : '99'} <span className="text-xs font-normal text-slate-500 dark:text-[#908fa0]">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#c7c4d7] pt-4 border-t border-slate-200 dark:border-[#2d3449]">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> 50,000 Messages / mo</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Unlimited Vector Documents</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Full Branding Customizer</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Developer API Keys & Webhooks</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Stripe Billing & Invoice Receipts</li>
                </ul>
              </div>
              <Link to="/register?plan=pro" className="w-full py-3 text-center rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all">
                Get Started with Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-8 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Custom vector pipelines and dedicated infrastructure.</p>
                <div className="text-3xl font-extrabold text-white">Custom</div>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-[#c7c4d7] pt-4 border-t border-slate-200 dark:border-[#2d3449]">
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Unlimited Messages & Storage</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Dedicated Vector DB Instances</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> Custom SLA & 24/7 Phone Support</li>
                  <li className="flex items-center gap-2"><span className="material-symbols-outlined text-[#10b981] text-[16px]">check</span> On-Prem / VPC Deployment</li>
                </ul>
              </div>
              <button className="w-full py-3 text-center rounded-xl bg-slate-200 dark:bg-[#222a3d] hover:bg-slate-300 dark:hover:bg-[#31394d] text-slate-800 dark:text-white font-semibold text-xs transition-colors">
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-slate-900 dark:bg-[#060e20] border-t border-slate-700 dark:border-[#2d3449] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-[#908fa0]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#6366f1] flex items-center justify-center text-white font-bold text-xs">AI</div>
            <span className="font-semibold text-white">Chatti AI Platform</span>
            <span>© 2026 All Rights Reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#api" className="hover:text-white transition-colors">API Docs</a>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
