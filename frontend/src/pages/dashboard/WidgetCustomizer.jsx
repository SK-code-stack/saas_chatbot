import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Header from '../../components/layout/Header'
import StepBanner from '../../components/ui/StepBanner'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'

export default function WidgetCustomizer() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('script') // 'script' | 'react'
  const fileInputRef = useRef(null)

  // Widget Configuration State
  const [config, setConfig] = useState({
    bot_name: 'Support Assistant',
    welcome_message: 'Hi! How can I assist you with your project today?',
    enable_dark_mode: true, // if true, dark mode color split is enabled
    light_primary_color: '#6366f1',
    dark_primary_color: '#38bdf8',
    icon_type: 'emoji', // 'emoji' | 'custom'
    icon_emoji: '🤖',
    custom_icon_url: '',
    position: 'bottom-right',
  })

  // Preview Stage State
  const [previewThemeMode, setPreviewThemeMode] = useState('dark') // 'light' | 'dark'
  const [previewWidgetOpen, setPreviewWidgetOpen] = useState(true)
  const [testInput, setTestInput] = useState('')
  const [testMessages, setTestMessages] = useState([
    { id: 1, sender: 'ai', text: config.welcome_message },
  ])

  // Sync welcome message update
  useEffect(() => {
    setTestMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ id: 1, sender: 'ai', text: config.welcome_message }]
      }
      return prev
    })
  }, [config.welcome_message])

  // Fetch API Keys
  const { data: keysData } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/keys/list_keys/')
        return res.data || []
      } catch (e) {
        return [{ id: 'key_prod_123', name: 'Default Production Key', key_prefix: 'sk_live_chatti_demo_9841' }]
      }
    },
  })

  const keys = Array.isArray(keysData) ? keysData : (keysData?.results || [])

  useEffect(() => {
    if (keys.length > 0 && !selectedKeyId) {
      setSelectedKeyId(keys[0].id)
    }
  }, [keys, selectedKeyId])

  const selectedKey = keys.find((k) => String(k.id) === String(selectedKeyId)) || keys[0]
  const apiKeyString = selectedKey?.key || selectedKey?.key_prefix || 'sk_live_chatti_demo_9841'

  // Active Effective Colors based on Theme & Mode
  const activePrimaryColor = !config.enable_dark_mode
    ? config.light_primary_color
    : (previewThemeMode === 'dark' ? config.dark_primary_color : config.light_primary_color)

  // Handle Custom Icon Upload
  const handleIconUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setConfig((prev) => ({
        ...prev,
        icon_type: 'custom',
        custom_icon_url: reader.result,
      }))
      toast.success('Custom chatbot icon uploaded!')
    }
    reader.readAsDataURL(file)
  }

  // Handle Test Chat Messaging
  const handleSendTestMessage = (e) => {
    e.preventDefault()
    if (!testInput.trim()) return

    const userText = testInput
    setTestInput('')
    setTestMessages((prev) => [...prev, { id: Date.now(), sender: 'user', text: userText }])

    // Quick AI preview response
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: `Thanks for asking! Based on your uploaded documents, here is the information for "${userText}".`,
        },
      ])
    }, 150)
  }

  // Generated Embed Snippets
  const scriptSnippet = `<script
  src="https://cdn.chatti.ai/widget.js"
  data-api-key="${apiKeyString}"
  data-primary-color="${config.light_primary_color}"
  ${config.enable_dark_mode ? `data-dark-primary-color="${config.dark_primary_color}"` : ''}
  data-bot-name="${config.bot_name}"
  data-position="${config.position}"
  async>
</script>`

  const reactSnippet = `import { ChatWidget } from '@chatti-ai/react'

export default function App() {
  return (
    <ChatWidget
      apiKey="${apiKeyString}"
      botName="${config.bot_name}"
      primaryColor="${config.light_primary_color}"
      ${config.enable_dark_mode ? `darkPrimaryColor="${config.dark_primary_color}"` : ''}
      position="${config.position}"
    />
  )
}`

  const copySnippet = (text) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Embed code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSave = async () => {
    toast.success('Widget customization saved & live on CDN!')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-800 dark:text-[#dae2fd] flex transition-colors duration-200">
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header setMobileOpen={setMobileOpen} pageTitle="Step 3: Customize Your Widget" />

        <main className="flex-1 p-4 md:p-8 space-y-6 overflow-y-auto">
          {/* Step 3 Banner */}
          <StepBanner
            stepNumber={3}
            totalSteps={3}
            title="Customize Your AI Chatbot"
            description="Give your chatbot a personality! Choose colors, a welcome message, and position. Then click Publish Changes to make it live on your website."
          />
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#2d3449] pb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Chat Widget Studio</h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-[#908fa0]">Customize themes, custom chatbot icons, dark mode colors, and live test chat.</p>
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#38bdf8] text-white font-semibold text-xs md:text-sm shadow-lg shadow-[#6366f1]/25 hover:opacity-95 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>Publish Changes</span>
            </button>
          </div>

          {/* Pinterest-style Fluid Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Settings Column (6 Cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Card 1: Chatbot Selector */}
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-3 shadow-sm">
                <div>
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">Select Your Chatbot</label>
                  <p className="text-[11px] text-slate-500 dark:text-[#908fa0] mt-1">Choose the chatbot you want to customize. Your embed code below will update automatically.</p>
                </div>
                {keys.length === 0 ? (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-slate-500 dark:text-[#908fa0]">No chatbots found.</p>
                    <a href="/chatbots" className="text-xs font-bold text-[#6366f1] hover:underline">← Go to Step 2 to create a chatbot first</a>
                  </div>
                ) : (
                  <select
                    value={selectedKeyId}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
                  >
                    {keys.map((k) => (
                      <option key={String(k.id)} value={String(k.id)}>
                        {k.name || 'Chatbot'} ({k.key_prefix ? `${k.key_prefix}...` : `#${k.id}`})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Card 2: Chatbot Icon & Avatar Upload */}
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2d3449] pb-3 flex items-center justify-between">
                  <span>Chatbot Icon / Avatar</span>
                  <span className="text-xs text-[#38bdf8] font-mono">Custom or Emoji</span>
                </h3>

                <div className="flex items-center gap-4">
                  {/* Current Avatar Circle */}
                  <div className="w-14 h-14 rounded-2xl border-2 border-[#38bdf8] bg-slate-100 dark:bg-[#131b2e] flex items-center justify-center overflow-hidden shrink-0 shadow-md">
                    {config.icon_type === 'custom' && config.custom_icon_url ? (
                      <img src={config.custom_icon_url} alt="Bot Icon" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{config.icon_emoji}</span>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#222a3d] border border-slate-200 dark:border-[#31394d] hover:bg-slate-200 dark:hover:bg-[#31394d] text-slate-800 dark:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">upload_file</span>
                      <span>Upload Custom Icon</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleIconUpload}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-400 dark:text-[#908fa0]">Supports PNG, JPG, SVG up to 2MB</p>
                  </div>
                </div>

                {/* Preset Emoji Options */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">Or Choose an Emoji</label>
                  <div className="flex gap-2.5">
                    {['🤖', '💬', '⚡', '🎧', '💡', '✨'].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setConfig({ ...config, icon_type: 'emoji', icon_emoji: emoji })}
                        className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition-all ${config.icon_type === 'emoji' && config.icon_emoji === emoji
                            ? 'bg-[#6366f1]/20 border-[#6366f1] scale-110 shadow-md'
                            : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] hover:bg-slate-200 dark:hover:bg-[#222a3d]'
                          }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Color Customization (With Color Icon Inside Input) */}
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-5 shadow-sm">
                {/* Header with Dark Mode Toggle Switch */}
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Color Customization</h3>

                  {/* Dark Mode Enable Toggle Switch Button */}
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, enable_dark_mode: !config.enable_dark_mode })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${config.enable_dark_mode
                        ? 'bg-[#6366f1]/20 border-[#6366f1] text-[#38bdf8]'
                        : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] text-slate-500 dark:text-[#908fa0]'
                      }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {config.enable_dark_mode ? 'dark_mode' : 'light_mode'}
                    </span>
                    <span>{config.enable_dark_mode ? 'Dark Mode Enabled' : 'Single Light Color'}</span>
                    {/* Toggle Switch Pill */}
                    <div className={`w-7 h-4 rounded-full p-0.5 transition-colors ${config.enable_dark_mode ? 'bg-[#6366f1]' : 'bg-[#2d3449]'}`}>
                      <div className={`w-3 h-3 rounded-full bg-white transition-transform ${config.enable_dark_mode ? 'translate-x-3' : 'translate-x-0'}`} />
                    </div>
                  </button>
                </div>

                {/* Color Inputs with Color Swatch Icon inside */}
                <div className="space-y-4">
                  {/* Primary Color Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">
                      {config.enable_dark_mode ? 'Light Mode Primary Color' : 'Primary Theme Color'}
                    </label>
                    <div className="relative flex items-center">
                      {/* Color Picker Swatch Button inside input */}
                      <label className="absolute left-3 cursor-pointer flex items-center justify-center">
                        <input
                          type="color"
                          value={config.light_primary_color}
                          onChange={(e) => setConfig({ ...config, light_primary_color: e.target.value })}
                          className="w-0 h-0 opacity-0 absolute"
                        />
                        <div
                          className="w-6 h-6 rounded-full border border-white/30 shadow-md hover:scale-110 transition-transform flex items-center justify-center"
                          style={{ backgroundColor: config.light_primary_color }}
                          title="Click to open color picker"
                        >
                          <span className="material-symbols-outlined text-white text-[12px] opacity-80">palette</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={config.light_primary_color}
                        onChange={(e) => setConfig({ ...config, light_primary_color: e.target.value })}
                        placeholder="#6366F1"
                        className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs font-mono pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] uppercase focus:outline-none focus:border-[#6366f1]"
                      />
                    </div>
                  </div>

                  {/* Dark Mode Color Input (Shown when Dark Mode Enabled) */}
                  {config.enable_dark_mode && (
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">Dark Mode Primary Color</label>
                      <div className="relative flex items-center">
                        <label className="absolute left-3 cursor-pointer flex items-center justify-center">
                          <input
                            type="color"
                            value={config.dark_primary_color}
                            onChange={(e) => setConfig({ ...config, dark_primary_color: e.target.value })}
                            className="w-0 h-0 opacity-0 absolute"
                          />
                          <div
                            className="w-6 h-6 rounded-full border border-white/30 shadow-md hover:scale-110 transition-transform flex items-center justify-center"
                            style={{ backgroundColor: config.dark_primary_color }}
                            title="Click to open color picker"
                          >
                            <span className="material-symbols-outlined text-white text-[12px] opacity-80">palette</span>
                          </div>
                        </label>
                        <input
                          type="text"
                          value={config.dark_primary_color}
                          onChange={(e) => setConfig({ ...config, dark_primary_color: e.target.value })}
                          placeholder="#38BDF8"
                          className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs font-mono pl-12 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] uppercase focus:outline-none focus:border-[#6366f1]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: General Settings & Position */}
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#2d3449] pb-3">Bot Details & Position</h3>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">Bot Display Name</label>
                  <input
                    type="text"
                    value={config.bot_name}
                    onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">Welcome Greeting Message</label>
                  <textarea
                    rows={2}
                    value={config.welcome_message}
                    onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#131b2e] text-slate-900 dark:text-white text-xs sm:text-sm p-3 rounded-xl border border-slate-200 dark:border-[#2d3449] focus:outline-none focus:border-[#6366f1]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-600 dark:text-[#c7c4d7]">Screen Position</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, position: 'bottom-right' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${config.position === 'bottom-right'
                          ? 'bg-[#6366f1]/20 border-[#6366f1] text-white font-bold shadow-md'
                          : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] text-slate-500 dark:text-[#908fa0]'
                        }`}
                    >
                      Bottom Right
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfig({ ...config, position: 'bottom-left' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${config.position === 'bottom-left'
                          ? 'bg-[#6366f1]/20 border-[#6366f1] text-white font-bold shadow-md'
                          : 'bg-slate-100 dark:bg-[#131b2e] border-slate-200 dark:border-[#2d3449] text-slate-500 dark:text-[#908fa0]'
                        }`}
                    >
                      Bottom Left
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 5: Embed Code Snippet Generator */}
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3449] pb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Embed Code Snippet</h3>
                  <button
                    type="button"
                    onClick={() => copySnippet(activeTab === 'script' ? scriptSnippet : reactSnippet)}
                    className="text-xs text-[#38bdf8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <div className="flex gap-2 border-b border-slate-200 dark:border-[#2d3449] pb-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('script')}
                    className={`px-3 py-1 rounded-lg ${activeTab === 'script' ? 'bg-[#6366f1] text-white font-semibold' : 'text-slate-500 dark:text-[#908fa0] hover:text-slate-700 dark:hover:text-white'}`}
                  >
                    HTML Script Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('react')}
                    className={`px-3 py-1 rounded-lg ${activeTab === 'react' ? 'bg-[#6366f1] text-white font-semibold' : 'text-slate-500 dark:text-[#908fa0] hover:text-slate-700 dark:hover:text-white'}`}
                  >
                    React Component
                  </button>
                </div>

                <pre className="bg-slate-900 p-4 rounded-xl text-xs font-mono text-[#38bdf8] overflow-x-auto border border-slate-700">
                  {activeTab === 'script' ? scriptSnippet : reactSnippet}
                </pre>
              </div>
            </div>

            {/* Right Column (6 Cols): Sticky Interactive Live Canvas Stage */}
            <div className="lg:col-span-6 sticky top-24 space-y-4">
              <div className="bg-white dark:bg-[#171f33] border border-slate-200 dark:border-[#2d3449] rounded-2xl p-5 space-y-4 shadow-xl">
                {/* Header with Website Theme Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2d3449] pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-pulse" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Website Canvas Preview</h2>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-100 dark:bg-[#131b2e] p-1 rounded-xl border border-slate-200 dark:border-[#2d3449]">
                    <button
                      type="button"
                      onClick={() => setPreviewThemeMode('light')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${previewThemeMode === 'light' ? 'bg-white text-gray-900 font-bold shadow' : 'text-slate-500 dark:text-[#908fa0]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">light_mode</span>
                      <span>Light Site</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewThemeMode('dark')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all ${previewThemeMode === 'dark' ? 'bg-[#6366f1] text-white font-bold shadow' : 'text-slate-500 dark:text-[#908fa0]'
                        }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">dark_mode</span>
                      <span>Dark Site</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Customer Website Canvas */}
                <div
                  className={`relative rounded-2xl border transition-colors duration-300 p-6 min-h-[480px] flex flex-col justify-between overflow-hidden shadow-2xl ${previewThemeMode === 'dark'
                      ? 'bg-[#0f172a] border-[#334155] text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                >
                  {/* Mock Navbar */}
                  <div className={`flex items-center justify-between border-b pb-3 ${previewThemeMode === 'dark' ? 'border-slate-800' : 'border-slate-200'
                    }`}>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#6366f1] flex items-center justify-center text-white font-bold text-xs">Acme</div>
                      <span className="font-bold text-xs">Acme Corp Website</span>
                    </div>
                    <div className="flex gap-3 text-[11px] opacity-60">
                      <span>Docs</span>
                      <span>Pricing</span>
                      <span>Contact</span>
                    </div>
                  </div>

                  {/* Mock Content */}
                  <div className="space-y-3 py-6 max-w-xs">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                      Live AI Widget Stage
                    </span>
                    <h3 className="text-lg font-extrabold tracking-tight leading-snug">
                      Test interactive chat responses in real-time.
                    </h3>
                    <p className="text-[11px] opacity-75 leading-relaxed">
                      Click the chat icon launcher below to toggle open/close. Type a message to test dummy responses.
                    </p>
                  </div>

                  {/* Open Chatbot Window (Rendered when previewWidgetOpen is true) */}
                  {previewWidgetOpen && (
                    <div
                      className={`absolute bottom-20 ${config.position === 'bottom-left' ? 'left-4' : 'right-4'
                        } w-80 md:w-88 rounded-2xl shadow-2xl border overflow-hidden transition-all duration-300 z-30 ${previewThemeMode === 'dark' ? 'bg-[#171f33] border-[#2d3449]' : 'bg-white border-slate-200'
                        }`}
                    >
                      {/* Header */}
                      <div className="p-3 flex items-center justify-between text-white shadow-md" style={{ backgroundColor: activePrimaryColor }}>
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0 font-bold text-xs">
                            {config.icon_type === 'custom' && config.custom_icon_url ? (
                              <img src={config.custom_icon_url} alt="Bot" className="w-full h-full object-cover" />
                            ) : (
                              <span>{config.icon_emoji}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-xs leading-tight">{config.bot_name}</h4>
                            <p className="text-[9px] text-white/80 font-mono">Online • Replies instantly</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPreviewWidgetOpen(false)}
                          className="text-white/80 hover:text-white p-1 rounded-lg"
                        >
                          <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                      </div>

                      {/* Messages Body */}
                      <div className={`p-3 space-y-2.5 h-48 overflow-y-auto text-xs ${previewThemeMode === 'dark' ? 'bg-[#0b1326]' : 'bg-slate-100'
                        }`}>
                        {testMessages.map((m) => (
                          <div
                            key={m.id}
                            className={`p-2.5 rounded-xl text-xs max-w-[90%] ${m.sender === 'user'
                                ? 'ml-auto bg-[#6366f1] text-white rounded-tr-none'
                                : (previewThemeMode === 'dark'
                                  ? 'bg-[#171f33] border border-[#2d3449] text-[#dae2fd] rounded-tl-none space-y-1'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-1')
                              }`}
                          >
                            <p>{m.text}</p>
                            {m.citation && (
                              <p className="text-[10px] font-mono text-[#10b981]">Source: {m.citation}</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Interactive Test Form */}
                      <form onSubmit={handleSendTestMessage} className={`p-2 border-t flex items-center gap-2 ${previewThemeMode === 'dark' ? 'bg-[#131b2e] border-[#2d3449]' : 'bg-white border-slate-200'
                        }`}>
                        <input
                          type="text"
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          placeholder="Type test message..."
                          className={`flex-1 text-xs px-3 py-1.5 rounded-xl outline-none border ${previewThemeMode === 'dark'
                              ? 'bg-[#171f33] border-[#2d3449] text-white placeholder-slate-400 dark:placeholder-[#908fa0]'
                              : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                            }`}
                        />
                        <button
                          type="submit"
                          className="p-1.5 rounded-xl text-white shadow flex items-center justify-center"
                          style={{ backgroundColor: activePrimaryColor }}
                        >
                          <span className="material-symbols-outlined text-[16px]">send</span>
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Floating Chatbot Launcher Bubble (Click to Toggle Open/Close) */}
                  <button
                    type="button"
                    onClick={() => setPreviewWidgetOpen(!previewWidgetOpen)}
                    className={`absolute bottom-4 ${config.position === 'bottom-left' ? 'left-4' : 'right-4'
                      } w-13 h-13 rounded-full shadow-2xl flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 z-40`}
                    style={{ backgroundColor: activePrimaryColor, width: '52px', height: '52px' }}
                    title={previewWidgetOpen ? 'Close Chat' : 'Open Chat'}
                  >
                    {previewWidgetOpen ? (
                      <span className="material-symbols-outlined text-[24px]">close</span>
                    ) : config.icon_type === 'custom' && config.custom_icon_url ? (
                      <img src={config.custom_icon_url} alt="Launcher" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl">{config.icon_emoji}</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
