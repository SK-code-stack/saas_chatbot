import { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Palette, Copy, Check, Upload, HelpCircle, Eye, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'

export default function WidgetCustomizer() {
  const [selectedKeyId, setSelectedKeyId] = useState('')
  const [selectedDocs, setSelectedDocs] = useState([])
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(true)
  const [previewDark, setPreviewDark] = useState(false)

  // Local state for widget settings
  const [config, setConfig] = useState({
    bot_name: 'AI Assistant',
    welcome_message: 'Hi! How can I help you today?',
    light_primary_color: '#6366f1',
    light_secondary_color: '#ffffff',
    dark_primary_color: '#818cf8',
    dark_secondary_color: '#1e1e2e',
    force_dark_mode: false,
    allow_user_toggle: true,
    icon_url: '',
    icon_emoji: '💬',
    position: 'bottom-right',
  })

  // 1. Fetch API Keys
  const { data: keys = [], isLoading: keysLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get('/api/keys/list_keys/')
      return res.data
    }
  })

  // 2. Fetch Documents
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents/')
      return res.data.results || res.data
    }
  })

  const readyDocs = documents.filter(doc => doc.status === 'completed' || doc.is_ready)

  // Auto-select first API Key when loaded
  useEffect(() => {
    if (keys.length > 0 && !selectedKeyId) {
      setSelectedKeyId(keys[0].id)
    }
  }, [keys, selectedKeyId])

  // 3. Fetch Config for selected API key
  const { data: serverConfig, refetch: refetchConfig, isLoading: configLoading } = useQuery({
    queryKey: ['widget-config', selectedKeyId],
    queryFn: async () => {
      if (!selectedKeyId) return null
      const res = await api.get(`/api/keys/${selectedKeyId}/widget-config/`)
      return res.data
    },
    enabled: !!selectedKeyId
  })

  // Sync server config to local state
  useEffect(() => {
    if (serverConfig) {
      setConfig({
        bot_name: serverConfig.bot_name || 'AI Assistant',
        welcome_message: serverConfig.welcome_message || 'Hi! How can I help you today?',
        light_primary_color: serverConfig.light_primary_color || '#6366f1',
        light_secondary_color: serverConfig.light_secondary_color || '#ffffff',
        dark_primary_color: serverConfig.dark_primary_color || '#818cf8',
        dark_secondary_color: serverConfig.dark_secondary_color || '#1e1e2e',
        force_dark_mode: !!serverConfig.force_dark_mode,
        allow_user_toggle: serverConfig.allow_user_toggle !== false,
        icon_url: serverConfig.icon_url || '',
        icon_emoji: serverConfig.icon_emoji || '💬',
        position: serverConfig.position || 'bottom-right',
      })
      setPreviewDark(!!serverConfig.force_dark_mode)
    }
  }, [serverConfig])

  // 4. Update Config Mutation
  const updateConfigMutation = useMutation({
    mutationFn: (newConfig) => api.put(`/api/keys/${selectedKeyId}/widget-config/`, newConfig),
    onSuccess: () => {
      toast.success('Widget settings updated!')
      refetchConfig()
    },
    onError: () => {
      toast.error('Failed to update widget settings')
    }
  })

  // 5. Upload Custom Icon Mutation
  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !selectedKeyId) return
    
    const formData = new FormData()
    formData.append('icon', file)
    setUploading(true)

    try {
      const res = await api.post(`/api/keys/${selectedKeyId}/widget-icon/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setConfig(prev => ({ ...prev, icon_url: res.data.icon_url }))
      toast.success('Icon uploaded successfully!')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Icon upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = () => {
    updateConfigMutation.mutate(config)
  }

  const handleDocToggle = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  // Find currently selected key object
  const activeKeyObj = keys.find(k => k.id === Number(selectedKeyId))
  const rawKeyPlaceholder = activeKeyObj
    ? `sk_live_your_key_prefix_${activeKeyObj.key_prefix}`
    : 'sk_live_your_api_key_here'

  // Embed script generation code
  const embedCode = `<script
  src="http://localhost:8000/static/widget.js"
  data-key-id="${selectedKeyId || 'KEY_ID'}"
  data-api-key="${activeKeyObj ? 'sk_live_...' /* security placeholder */ : 'YOUR_API_KEY'}"
  data-docs="${selectedDocs.join(',')}"
  data-api-url="http://localhost:8000"
></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(embedCode)
    setCopied(true)
    toast.success('Embed code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Dynamic CSS variables for local preview
  const previewStyles = {
    '--wg-primary': previewDark ? config.dark_primary_color : config.light_primary_color,
    '--wg-secondary': previewDark ? config.dark_secondary_color : config.light_secondary_color,
    '--wg-text': previewDark ? '#e2e8f0' : '#111827',
    '--wg-bot-bg': previewDark ? '#2d2d3f' : '#f3f4f6',
    '--wg-bot-text': previewDark ? '#e2e8f0' : '#111827',
    '--wg-border': previewDark ? '#3d3d5c' : '#e5e7eb',
    '--wg-input-bg': previewDark ? '#2d2d3f' : '#ffffff',
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Palette className="text-primary-500" size={26} /> Widget Customizer
        </h1>
        <p className="text-gray-500 mt-1">Design and embed your custom AI chatbot widget</p>
      </div>

      {keysLoading ? (
        <div className="text-center py-12 text-gray-400">Loading settings...</div>
      ) : keys.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-500">You need an active API key to create a chatbot widget.</p>
          <a href="/api-keys">
            <Button className="mt-4">Go to API Keys page</Button>
          </a>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Customization Form */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <Card title="Widget Configuration">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Select API Key</label>
                  <select
                    value={selectedKeyId}
                    onChange={(e) => setSelectedKeyId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500"
                  >
                    {keys.map(k => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.key_prefix}••••••••)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Bot Name"
                    value={config.bot_name}
                    onChange={(e) => setConfig({ ...config, bot_name: e.target.value })}
                  />
                  <Input
                    label="Welcome Message"
                    value={config.welcome_message}
                    onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                  />
                </div>

                {/* Colors Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-3">Colors</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Light Primary</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1.5 bg-white">
                        <input
                          type="color"
                          value={config.light_primary_color}
                          onChange={(e) => setConfig({ ...config, light_primary_color: e.target.value })}
                          className="w-6 h-6 rounded-md border border-gray-100 cursor-pointer overflow-hidden"
                        />
                        <span className="text-xs font-mono">{config.light_primary_color}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Light Background</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1.5 bg-white">
                        <input
                          type="color"
                          value={config.light_secondary_color}
                          onChange={(e) => setConfig({ ...config, light_secondary_color: e.target.value })}
                          className="w-6 h-6 rounded-md border border-gray-100 cursor-pointer overflow-hidden"
                        />
                        <span className="text-xs font-mono">{config.light_secondary_color}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Dark Primary</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1.5 bg-white">
                        <input
                          type="color"
                          value={config.dark_primary_color}
                          onChange={(e) => setConfig({ ...config, dark_primary_color: e.target.value })}
                          className="w-6 h-6 rounded-md border border-gray-100 cursor-pointer overflow-hidden"
                        />
                        <span className="text-xs font-mono">{config.dark_primary_color}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-gray-500">Dark Background</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg p-1.5 bg-white">
                        <input
                          type="color"
                          value={config.dark_secondary_color}
                          onChange={(e) => setConfig({ ...config, dark_secondary_color: e.target.value })}
                          className="w-6 h-6 rounded-md border border-gray-100 cursor-pointer overflow-hidden"
                        />
                        <span className="text-xs font-mono">{config.dark_secondary_color}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dark Mode Controls */}
                <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.force_dark_mode}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setConfig({ ...config, force_dark_mode: checked })
                        if (checked) setPreviewDark(true)
                      }}
                      className="accent-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Force Dark Mode</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.allow_user_toggle}
                      onChange={(e) => setConfig({ ...config, allow_user_toggle: e.target.checked })}
                      className="accent-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Allow user to toggle dark mode (shows 🌙/☀️ toggle)</span>
                  </label>
                </div>

                {/* Icon selection / upload */}
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Widget Bubble Icon</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Fallback Emoji Icon"
                      value={config.icon_emoji}
                      onChange={(e) => setConfig({ ...config, icon_emoji: e.target.value })}
                    />
                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Upload Custom Image</label>
                      <div className="flex gap-2 items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="hidden"
                          id="icon-upload-input"
                        />
                        <label
                          htmlFor="icon-upload-input"
                          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50 hover:border-primary-300"
                        >
                          <Upload size={16} /> {uploading ? 'Uploading...' : 'Choose image'}
                        </label>
                        {config.icon_url && (
                          <div className="w-9 h-9 rounded-full border border-gray-200 overflow-hidden flex items-center justify-center">
                            <img src={config.icon_url} alt="Custom Icon Preview" className="object-cover w-full h-full" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Position */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Screen Position</label>
                    <select
                      value={config.position}
                      onChange={(e) => setConfig({ ...config, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <Button variant="secondary" onClick={() => refetchConfig()}>Reset</Button>
                  <Button onClick={handleSave} loading={updateConfigMutation.isPending}>Save Configuration</Button>
                </div>
              </div>
            </Card>

            {/* Document Selection for code embedding */}
            <Card title="Embed Settings & Code">
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-800 mb-2">Select Documents for Chat</h3>
                  <p className="text-xs text-gray-400 mb-3">Choose the knowledge base documents this widget is authorized to chat about.</p>
                  
                  {readyDocs.length === 0 ? (
                    <div className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      No ready documents yet. Upload and process documents first so your widget has knowledge to chat with!
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {readyDocs.map(doc => (
                        <label key={doc.id} className="flex items-center gap-2 border border-gray-100 rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={() => handleDocToggle(doc.id)}
                            className="accent-primary-500"
                          />
                          <span className="text-xs font-medium text-gray-700">{doc.title}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {embedCode}
                  </pre>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    title="Copy Code"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="text-xs text-gray-400 flex items-start gap-1.5">
                  <HelpCircle size={14} className="shrink-0 mt-0.5" />
                  <span>
                    Copy the above script and place it inside the <code>&lt;head&gt;</code> or <code>&lt;body&gt;</code> of your website.
                    Replace the placeholder arguments as needed.
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right panel: Live Preview Frame */}
          <div className="lg:col-span-5 flex flex-col gap-4 sticky top-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="font-semibold text-gray-800 flex items-center gap-1.5">
                <Eye size={18} className="text-gray-500" /> Live Preview
              </h3>
              <div className="flex items-center gap-2">
                {config.allow_user_toggle && !config.force_dark_mode && (
                  <button
                    onClick={() => setPreviewDark(!previewDark)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    {previewDark ? '☀️ Light Preview' : '🌙 Dark Preview'}
                  </button>
                )}
                <button
                  onClick={() => setPreviewOpen(!previewOpen)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-2.5 py-1.5 rounded-lg"
                >
                  {previewOpen ? 'Hide Widget' : 'Show Widget'}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 bg-gray-100 rounded-2xl h-[620px] relative overflow-hidden flex flex-col items-center justify-center p-4">
              <span className="text-xs text-gray-400 absolute top-4 text-center">Your webpage preview context</span>

              {/* Simulated webpage element */}
              <div className="w-full text-center px-6">
                <h4 className="text-lg font-bold text-gray-700">Simulated Website</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">Your widget will float correctly on this page according to your customization settings.</p>
              </div>

              {/* ChatBox Preview */}
              <div
                style={previewStyles}
                className={`absolute w-[350px] h-[480px] bg-[var(--wg-secondary)] text-[var(--wg-text)] border border-[var(--wg-border)] rounded-2xl shadow-xl flex flex-col overflow-hidden transition-all duration-300
                  ${previewOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'}
                  ${config.position === 'bottom-left' ? 'left-6 bottom-20' : 'right-6 bottom-20'}`}
              >
                {/* Header */}
                <div className="bg-[var(--wg-primary)] text-white px-4 py-3 flex items-center justify-between shadow-sm">
                  <span className="font-semibold text-sm">{config.bot_name}</span>
                  <div className="flex items-center gap-2">
                    {config.allow_user_toggle && !config.force_dark_mode && (
                      <span className="text-xs cursor-pointer opacity-80 hover:opacity-100">
                        {previewDark ? '☀️' : '🌙'}
                      </span>
                    )}
                    <span className="text-xs cursor-pointer opacity-80 hover:opacity-100">✕</span>
                  </div>
                </div>

                {/* Messages list */}
                <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                  <div className="bg-[var(--wg-bot-bg)] text-[var(--wg-bot-text)] px-3 py-2 rounded-2xl rounded-bl-sm text-xs self-start max-w-[85%] leading-relaxed">
                    {config.welcome_message}
                  </div>
                  <div className="bg-[var(--wg-primary)] text-white px-3 py-2 rounded-2xl rounded-br-sm text-xs self-end max-w-[85%] leading-relaxed">
                    Hi! I want to ask about my pricing plans.
                  </div>
                  <div className="bg-[var(--wg-bot-bg)] text-[var(--wg-bot-text)] px-3 py-2 rounded-2xl rounded-bl-sm text-xs self-start max-w-[85%] leading-relaxed flex items-center gap-1">
                    Sure! We offer Free, Pro, and Enterprise tiers.
                  </div>
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-[var(--wg-border)] flex gap-2">
                  <input
                    disabled
                    placeholder="Ask a question..."
                    className="flex-grow px-3 py-1.5 border border-[var(--wg-border)] bg-[var(--wg-input-bg)] text-[var(--wg-text)] rounded-lg text-xs outline-none"
                  />
                  <button
                    disabled
                    className="bg-[var(--wg-primary)] text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    ➤
                  </button>
                </div>
              </div>

              {/* Chat Bubble Toggle Button Preview */}
              <button
                style={{ backgroundColor: previewDark ? config.dark_primary_color : config.light_primary_color }}
                className={`absolute w-14 h-14 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-105 transition-transform duration-200
                  ${config.position === 'bottom-left' ? 'left-6 bottom-4' : 'right-6 bottom-4'}`}
                onClick={() => setPreviewOpen(!previewOpen)}
              >
                {config.icon_url ? (
                  <img src={config.icon_url} alt="custom logo" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  config.icon_emoji
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
