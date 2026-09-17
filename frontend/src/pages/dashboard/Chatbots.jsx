import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import StepBanner from '../../components/ui/StepBanner'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function Chatbots() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('business') // 'business' | 'developer'
  const [botName, setBotName] = useState('')
  const [selectedDocIds, setSelectedDocIds] = useState([])
  const [createdKeyData, setCreatedKeyData] = useState(null)
  const [copied, setCopied] = useState(null) // 'script' | 'apikey' | 'curl'

  // ── Fetch uploaded documents ──────────────────────────────────
  const { data: rawDocs = [], isLoading: docsLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/documents/')
        return res.data.results || res.data || []
      } catch {
        return [
          { id: '1', title: 'company_policy_v2.pdf', chunk_count: 84 },
          { id: '2', title: 'product_api_documentation.docx', chunk_count: 42 },
          { id: '3', title: 'pricing_guide.pdf', chunk_count: 18 },
        ]
      }
    },
  })
  const docs = Array.isArray(rawDocs) ? rawDocs : []

  // ── Fetch existing chatbots ───────────────────────────────────
  const { data: rawKeys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/keys/list_keys/')
        return res.data || []
      } catch {
        return []
      }
    },
  })
  const chatbots = Array.isArray(rawKeys) ? rawKeys : (rawKeys?.results || [])

  const toggleDoc = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(String(id)) ? prev.filter((d) => d !== String(id)) : [...prev, String(id)]
    )
  }

  // ── Create Chatbot Mutation ───────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/keys/create_key/', data),
    onSuccess: (res) => {
      setCreatedKeyData(res.data)
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      setBotName('')
      setSelectedDocIds([])
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create chatbot'),
  })

  // ── Delete Chatbot Mutation (optimistic) ─────────────────────
  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/keys/${id}/`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['api-keys'] })
      const prev = queryClient.getQueryData(['api-keys'])
      queryClient.setQueryData(['api-keys'], (old) =>
        Array.isArray(old) ? old.filter((k) => String(k.id) !== String(id)) : old
      )
      toast.success('Chatbot deleted!')
      return { prev }
    },
    onError: (err, _id, ctx) => {
      queryClient.setQueryData(['api-keys'], ctx?.prev)
      toast.error(err.response?.data?.error || 'Failed to delete')
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['api-keys'] }),
  })

  const handleCreate = () => {
    if (!botName.trim()) { toast.error('Please give your chatbot a name first'); return }
    if (selectedDocIds.length === 0) { toast.error('Please select at least one document'); return }
    createMutation.mutate({ name: botName.trim(), document_ids: selectedDocIds.map(Number) })
  }

  const copyText = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    toast.success('Copied!')
    setTimeout(() => setCopied(null), 2000)
  }

  // ── Embed snippets ────────────────────────────────────────────
  const apiKey = createdKeyData?.raw_key || 'sk_live_...'
  const botNameDisplay = createdKeyData?.name || botName || 'My Chatbot'

  const scriptTag = `<script
  src="https://cdn.chatti.ai/widget.js"
  data-api-key="${apiKey}"
  data-bot-name="${botNameDisplay}"
  async>
</script>`

  const curlExample = `curl -X POST https://api.chatti.ai/v1/chat \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello, what are your pricing plans?"}'`

  // ── UI ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Step 2: Create Your Chatbot" />
        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">

          <StepBanner
            stepNumber={2}
            totalSteps={3}
            title="Create Your Chatbot"
            description="Give your chatbot a name and choose which documents it should know. After creating it, go to Step 3 to customize the look and get your embed code."
            nextPath="/widget"
            nextText="Step 3: Customize Widget →"
          />

          {/* ── Tab Switcher ──────────────────────────────────── */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-200 dark:border-[#2d3449]">
              {[
                { id: 'business', icon: 'storefront', label: 'For My Business Website', sublabel: 'Get embed script' },
                { id: 'developer', icon: 'code', label: 'For Developers', sublabel: 'Script + REST API key' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setCreatedKeyData(null) }}
                  className={`flex-1 py-4 px-4 text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? tab.id === 'business'
                        ? 'bg-[#6366f1]/10 text-[#6366f1] border-b-2 border-[#6366f1]'
                        : 'bg-[#38bdf8]/10 text-[#38bdf8] border-b-2 border-[#38bdf8]'
                      : 'text-slate-500 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#222a3d]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                  <div className="text-center sm:text-left">
                    <div className="leading-tight">{tab.label}</div>
                    <div className="text-[10px] font-normal opacity-70">{tab.sublabel}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-6 space-y-6">
              {/* Context tip */}
              <div className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                activeTab === 'business'
                  ? 'bg-[#6366f1]/10 border border-[#6366f1]/20 text-indigo-700 dark:text-[#a5b4fc]'
                  : 'bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-sky-700 dark:text-[#7dd3fc]'
              }`}>
                {activeTab === 'business'
                  ? '🏪 You will get a simple 1-line script tag. Paste it into your website HTML and your chatbot appears instantly — no coding needed.'
                  : '🛠️ You get both the embed script tag AND a secret REST API key for connecting your mobile app, server, or custom integration.'}
              </div>

              {/* ── Create Form (shown when no result yet) ──────── */}
              {!createdKeyData && (
                <>
                  {/* Step A: Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-xs font-black text-white shrink-0">A</span>
                      Give your chatbot a name
                    </label>
                    <input
                      type="text"
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                      placeholder={activeTab === 'business' ? 'e.g. Support Bot, FAQ Helper...' : 'e.g. Production Bot, v2 Agent...'}
                      className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1] placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-[#908fa0] transition-colors"
                    />
                  </div>

                  {/* Step B: Pick Documents */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#6366f1] flex items-center justify-center text-xs font-black text-white shrink-0">B</span>
                      Choose which documents your chatbot should know
                    </label>

                    {docsLoading ? (
                      <div className="text-xs text-slate-400 dark:text-[#908fa0] py-4 text-center">Loading your documents...</div>
                    ) : docs.length === 0 ? (
                      <div className="border-2 border-dashed border-slate-200 dark:border-[#2d3449] rounded-xl p-6 text-center space-y-2">
                        <span className="material-symbols-outlined text-[32px] text-slate-300 dark:text-[#2d3449] block">folder_open</span>
                        <p className="text-xs text-slate-400 dark:text-[#908fa0]">No documents uploaded yet.</p>
                        <button onClick={() => navigate('/documents')} className="text-xs font-bold text-[#6366f1] hover:underline cursor-pointer">
                          ← Go to Step 1 and upload documents first
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
                          {docs.map((doc) => {
                            const isSelected = selectedDocIds.includes(String(doc.id))
                            return (
                              <button
                                key={doc.id}
                                onClick={() => toggleDoc(doc.id)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'border-[#6366f1] bg-[#6366f1]/10 text-slate-900 dark:text-white'
                                    : 'border-slate-200 dark:border-[#2d3449] bg-slate-50 dark:bg-[#131b2e] text-slate-500 dark:text-[#908fa0] hover:border-[#6366f1]/40 hover:text-slate-900 dark:hover:text-white'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                                  isSelected ? 'border-[#6366f1] bg-[#6366f1]' : 'border-slate-300 dark:border-[#2d3449]'
                                }`}>
                                  {isSelected && <span className="material-symbols-outlined text-[13px] text-white">check</span>}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold truncate">{doc.title || doc.filename || 'Untitled'}</p>
                                  <p className="text-[10px] text-[#10b981] mt-0.5">{doc.chunk_count ? `${doc.chunk_count} chunks` : 'Indexed'}</p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        {selectedDocIds.length > 0 && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            ✓ {selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} selected
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreate}
                    disabled={createMutation.isPending || !botName.trim() || selectedDocIds.length === 0}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-bold text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {createMutation.isPending ? (
                      <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span><span>Creating...</span></>
                    ) : (
                      <><span className="material-symbols-outlined text-[18px]">rocket_launch</span><span>Create & Get My Code</span></>
                    )}
                  </button>
                </>
              )}

              {/* ── Success: Show code ─────────────────────────── */}
              {createdKeyData && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 rounded-xl">
                    <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[24px]">check_circle</span>
                    <div>
                      <p className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">"{createdKeyData.name}" is ready!</p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">Copy the code below and add it to your website or app.</p>
                    </div>
                  </div>

                  {/* Script Tag — shown for BOTH tabs */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-[#c7c4d7] uppercase tracking-wider flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#6366f1] text-[16px]">code</span>
                        {activeTab === 'business' ? 'Your Website Embed Code' : 'Embed Script Tag'}
                      </label>
                      <button
                        onClick={() => copyText(scriptTag, 'script')}
                        className="px-3 py-1 rounded-lg bg-[#6366f1] hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                        {copied === 'script' ? 'Copied!' : 'Copy Code'}
                      </button>
                    </div>
                    <pre className="bg-slate-900 text-sky-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-700 leading-relaxed">
{scriptTag}
                    </pre>
                    {activeTab === 'business' && (
                      <p className="text-xs text-slate-500 dark:text-[#908fa0]">
                        💡 Paste this code just before the <code className="bg-slate-100 dark:bg-[#222a3d] px-1 rounded">&lt;/body&gt;</code> tag on any page of your website.
                      </p>
                    )}
                  </div>

                  {/* Developer-only section: API Key + cURL */}
                  {activeTab === 'developer' && (
                    <>
                      {/* Secret API Key */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-[#c7c4d7] uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#38bdf8] text-[16px]">key</span>
                            Secret REST API Key
                          </label>
                          <button
                            onClick={() => copyText(createdKeyData.raw_key, 'apikey')}
                            className="px-3 py-1 rounded-lg bg-[#38bdf8] hover:bg-sky-400 text-[#00354a] text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            {copied === 'apikey' ? 'Copied!' : 'Copy Key'}
                          </button>
                        </div>
                        <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl font-mono text-xs text-sky-300 break-all select-all">
                          {createdKeyData.raw_key}
                        </div>
                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                          ⚠️ Save this key now — it will never be shown again.
                        </p>
                      </div>

                      {/* cURL Example */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700 dark:text-[#c7c4d7] uppercase tracking-wider flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#10b981] text-[16px]">terminal</span>
                            cURL Example
                          </label>
                          <button
                            onClick={() => copyText(curlExample, 'curl')}
                            className="px-3 py-1 rounded-lg bg-[#10b981] hover:bg-emerald-600 text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">content_copy</span>
                            {copied === 'curl' ? 'Copied!' : 'Copy cURL'}
                          </button>
                        </div>
                        <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-700 leading-relaxed">
{curlExample}
                        </pre>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => setCreatedKeyData(null)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#131b2e] border border-slate-200 dark:border-[#2d3449] text-slate-600 dark:text-[#908fa0] hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    + Create Another Chatbot
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Existing Chatbots Table ──────────────────────────── */}
          <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Your Chatbots</h3>
                <p className="text-xs text-slate-500 dark:text-[#908fa0]">Click "Customize" to change colors and appearance (Step 2)</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono font-bold rounded-full bg-[#6366f1]/20 text-[#6366f1] dark:text-[#a5b4fc] border border-[#6366f1]/30">
                {chatbots.length} / 5
              </span>
            </div>

            {keysLoading ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-[#908fa0]">Loading chatbots...</div>
            ) : chatbots.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <span className="material-symbols-outlined text-[40px] text-slate-200 dark:text-[#2d3449] block">smart_toy</span>
                <p className="text-xs text-slate-400 dark:text-[#908fa0]">No chatbots yet. Use the form above to create your first one!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 dark:text-slate-500 dark:text-[#908fa0] uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-200 dark:border-[#2d3449]/50">
                      <th className="pb-3">Chatbot Name</th>
                      <th className="pb-3">Docs Linked</th>
                      <th className="pb-3">Created</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#2d3449]/30 text-slate-700 dark:text-[#dae2fd]">
                    {chatbots.map((bot) => (
                      <tr key={bot.id} className="hover:bg-slate-50 dark:hover:bg-[#222a3d]/40 transition-colors">
                        <td className="py-3.5 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#6366f1] text-[16px]">smart_toy</span>
                            {bot.name || 'Unnamed Bot'}
                          </div>
                        </td>
                        <td className="py-3.5 font-mono text-[#38bdf8]">
                          {Array.isArray(bot.document_ids) && bot.document_ids.length > 0
                            ? `${bot.document_ids.length} doc${bot.document_ids.length > 1 ? 's' : ''}`
                            : <span className="text-slate-400 dark:text-[#908fa0]">—</span>}
                        </td>
                        <td className="py-3.5 text-slate-400 dark:text-[#908fa0]">
                          {bot.created_at ? new Date(bot.created_at).toLocaleDateString() : 'Recently'}
                        </td>
                        <td className="py-3.5">
                          {bot.is_active !== false ? (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">Active</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-500 dark:text-red-400 border border-red-500/30">Revoked</span>
                          )}
                        </td>
                        <td className="py-3.5 text-right space-x-2">
                          <button
                            onClick={() => navigate('/documents')}
                            className="px-3 py-1.5 rounded-lg bg-[#6366f1] hover:bg-indigo-700 text-white text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[13px]">tune</span>
                            Customize
                          </button>
                          <button
                            onClick={() => deleteMutation.mutate(bot.id)}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-[#908fa0] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 border border-transparent hover:border-red-200 dark:hover:border-red-500/20 transition-all cursor-pointer inline-flex items-center"
                            title="Delete chatbot permanently"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-[#908fa0] pb-4">
            <button onClick={() => navigate('/documents')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back to Step 1: Knowledge Base
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
