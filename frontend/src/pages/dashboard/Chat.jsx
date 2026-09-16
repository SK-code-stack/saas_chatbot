import React, { useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import toast from 'react-hot-toast'

export default function Chat() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSession, setActiveSession] = useState('SESS-1049')
  const [inputMessage, setInputMessage] = useState('')

  const sessions = [
    { id: 'SESS-1049', user: 'sarah.dev@stripe.com', lastMsg: 'How do I generate API keys?', time: '2 mins ago', status: 'Resolved' },
    { id: 'SESS-1048', user: 'growth@acme.org', lastMsg: 'Can I embed widget on WordPress?', time: '18 mins ago', status: 'Active' },
    { id: 'SESS-1047', user: 'ceo@techstartup.io', lastMsg: 'Stripe subscription upgrade issue', time: '1 hr ago', status: 'Escalated' },
    { id: 'SESS-1046', user: 'user_49201', lastMsg: 'What documents are indexed?', time: '3 hrs ago', status: 'Resolved' },
  ]

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'user',
      text: 'How do I generate production API keys and restrict webhooks?',
      time: '10:42 AM',
    },
    {
      id: 2,
      sender: 'ai',
      text: 'You can generate scoped API keys directly from the Developer Hub page under `/api-keys`. Webhooks can be configured to listen strictly to specific events like `message.created` or `doc.indexed`.',
      citation: 'docs/developer-guide/api_keys_v2.md (Similarity: 97.8%)',
      time: '10:42 AM',
    },
  ])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputMessage.trim()) return

    const userText = inputMessage
    setInputMessage('')

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'user', text: userText, time: 'Just now' },
    ])

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Processed query "${userText}" using the RAG model pipeline. Results match indexed vectors in your knowledge base.`,
          citation: 'knowledge_base/vector_index_01.pdf (Similarity: 96.4%)',
          time: 'Just now',
        },
      ])
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#0b1326] text-[#dae2fd] flex">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Chat Log & Inspector" />

        <main className="flex-1 p-4 md:p-8 flex flex-col lg:flex-row gap-6 overflow-hidden">
          {/* Left Session Column (4 Cols) */}
          <div className="w-full lg:w-80 bg-[#171f33] border border-[#2d3449] rounded-2xl flex flex-col shrink-0">
            <div className="p-4 border-b border-[#2d3449] space-y-3">
              <h2 className="text-sm font-bold text-white">Chat Sessions Log</h2>
              <div className="flex items-center gap-2 bg-[#131b2e] px-3 py-2 rounded-xl border border-[#2d3449] text-xs text-[#908fa0]">
                <span className="material-symbols-outlined text-[16px]">search</span>
                <input type="text" placeholder="Search sessions..." className="bg-transparent outline-none text-white text-xs w-full" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#2d3449]/30">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => setActiveSession(sess.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    activeSession === sess.id ? 'bg-[#222a3d] border-l-4 border-[#6366f1]' : 'hover:bg-[#131b2e]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-[#38bdf8] font-bold">{sess.id}</span>
                    <span className="text-[10px] text-[#908fa0]">{sess.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-white truncate">{sess.user}</p>
                  <p className="text-[11px] text-[#908fa0] truncate mt-0.5">{sess.lastMsg}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      sess.status === 'Resolved'
                        ? 'bg-[#10b981]/20 text-[#10b981]'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {sess.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Main Chat Panel */}
          <div className="flex-1 bg-[#171f33] border border-[#2d3449] rounded-2xl flex flex-col overflow-hidden min-h-[550px]">
            {/* Chat Inspector Top Header */}
            <div className="p-4 bg-[#222a3d] border-b border-[#2d3449] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8] flex items-center justify-center text-white font-bold text-xs">
                  S
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Session: {activeSession}</h3>
                  <p className="text-[11px] text-[#908fa0]">User: sarah.dev@stripe.com • IP: 192.168.1.42</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => toast.success('Escalated to human support queue!')}
                  className="px-3 py-1.5 rounded-xl bg-[#131b2e] border border-[#2d3449] hover:bg-[#31394d] text-xs text-[#38bdf8] font-semibold transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">support_agent</span>
                  <span>Handover to Human</span>
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#0b1326]/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[80%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    m.sender === 'user' ? 'bg-[#222a3d] text-[#c7c4d7]' : 'bg-[#6366f1] text-white'
                  }`}>
                    {m.sender === 'user' ? 'U' : 'AI'}
                  </div>
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-[#222a3d] text-white rounded-tr-none'
                      : 'bg-[#6366f1]/10 border border-[#6366f1]/20 text-[#dae2fd] rounded-tl-none space-y-2'
                  }`}>
                    <p>{m.text}</p>
                    {m.citation && (
                      <div className="flex items-center gap-1.5 pt-2 border-t border-[#6366f1]/20 text-[11px] font-mono text-[#10b981]">
                        <span className="material-symbols-outlined text-[14px]">database</span>
                        <span>Source: {m.citation}</span>
                      </div>
                    )}
                    <span className="text-[10px] text-[#908fa0] block text-right font-mono">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#171f33] border-t border-[#2d3449] flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Test a question against the live RAG vector model..."
                className="flex-1 bg-[#131b2e] text-white text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#2d3449] focus:outline-none focus:border-[#6366f1] placeholder-[#908fa0]"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#6366f1] text-white hover:bg-[#4f46e5] font-semibold text-xs transition-colors shadow-md shadow-[#6366f1]/20 flex items-center gap-1"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[16px]">send</span>
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}