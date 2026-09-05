import { useState } from 'react'
import { Key, Copy, Trash2, Plus, Eye, EyeOff, Code, FileText, Check, Sparkles, Terminal } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'

export default function APIKeys() {
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedDocs, setSelectedDocs] = useState([])
  const [createdKeyInfo, setCreatedKeyInfo] = useState(null) // { raw_key, id, name }
  const [showRawKey, setShowRawKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)
  const [devMode, setDevMode] = useState(false)

  const queryClient = useQueryClient()

  // 1. Fetch User Documents
  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents/')
      return res.data.results || res.data
    }
  })
  const readyDocs = documents.filter(d => d.status === 'completed' || d.is_ready)

  // 2. Fetch API Keys
  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get('/api/keys/list_keys/')
      return res.data
    }
  })

  // 3. Create Key Mutation
  const createMutation = useMutation({
    mutationFn: (data) => api.post('/api/keys/create_key/', data),
    onSuccess: (res) => {
      setCreatedKeyInfo(res.data)
      setNewKeyName('')
      setSelectedDocs([])
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('Chatbot Key created successfully!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create key')
  })

  const revokeMutation = useMutation({
    mutationFn: (id) => api.post(`/api/keys/${id}/revoke/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('Key revoked')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/keys/${id}/delete_key/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('Key deleted')
    }
  })

  const toggleDocSelect = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const handleCreate = () => {
    if (!newKeyName.trim()) return toast.error('Please enter a name for your key')
    createMutation.mutate({
      name: newKeyName.trim(),
      document_ids: selectedDocs
    })
  }

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'key') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else {
      setCopiedScript(true)
      setTimeout(() => setCopiedScript(false), 2000)
    }
    toast.success('Copied to clipboard!')
  }

  // Generate embed snippet for created key
  const getEmbedScript = (keyObj) => {
    if (!keyObj) return ''
    return `<script
  src="http://localhost:8000/static/widget.js"
  data-key-id="${keyObj.id}"
  data-api-key="${keyObj.raw_key}"
  data-api-url="http://localhost:8000"
></script>`
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-primary-500" size={26} /> 
            {devMode ? 'Developer API Keys' : 'Website Chatbot Embeds'}
          </h1>
          <p className="text-gray-500 mt-1">
            {devMode 
              ? 'Manage API keys and developer integration payloads'
              : 'Generate zero-config chatbot script tags for your websites'}
          </p>
        </div>

        {/* Mode Toggle Switch */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-xl self-start sm:self-auto border border-gray-200">
          <button
            onClick={() => setDevMode(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              !devMode ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            👤 User Mode
          </button>
          <button
            onClick={() => setDevMode(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              devMode ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Code size={14} /> Dev Mode
          </button>
        </div>
      </div>

      {/* Step 1: Create New Key Form */}
      <Card title={devMode ? "Generate API Key" : "Create New Website Chatbot Widget"} className="mb-6">
        <div className="flex flex-col gap-4">
          <Input
            label="Widget / Key Name"
            placeholder="e.g. My Website Bot, Sales Assistant"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
          />

          {/* Document Multi-select Picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Select Knowledge Base Documents <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Select which documents this chatbot is allowed to search through. If none selected, all completed documents will be included automatically.
            </p>

            {readyDocs.length === 0 ? (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                No processed documents found yet. Upload documents under the <b>Documents</b> tab first!
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {readyDocs.map(doc => (
                  <label
                    key={doc.id}
                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      selectedDocs.includes(doc.id)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(doc.id)}
                      onChange={() => toggleDocSelect(doc.id)}
                      className="accent-primary-500"
                    />
                    <FileText size={14} />
                    <span>{doc.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-2">
            <Button
              onClick={handleCreate}
              loading={createMutation.isPending}
              disabled={!newKeyName.trim()}
            >
              <Plus size={16} className="mr-1" /> {devMode ? 'Generate API Key' : 'Generate Ready Script Tag'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Step 2: Created Key Success Banner & Copy Options */}
      {createdKeyInfo && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-6 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="text-emerald-600" size={22} />
              <h3 className="font-bold text-emerald-900 text-base">Your Chatbot is Ready!</h3>
            </div>
            <button
              onClick={() => setCreatedKeyInfo(null)}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Dismiss
            </button>
          </div>

          {/* Option A: Ready-to-Use Embed Script Tag */}
          <div>
            <p className="text-sm font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
              <span>📋 Option 1: Zero-Config Script Tag</span>
              <span className="text-xs font-normal text-emerald-600">(Just copy and paste into your website HTML)</span>
            </p>
            <div className="relative">
              <pre className="bg-gray-900 text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {getEmbedScript(createdKeyInfo)}
              </pre>
              <button
                onClick={() => copyToClipboard(getEmbedScript(createdKeyInfo), 'script')}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 shadow-sm transition-colors"
              >
                {copiedScript ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedScript ? 'Copied!' : 'Copy Script Tag'}</span>
              </button>
            </div>
          </div>

          {/* Option B: Raw API Key (For developers) */}
          {devMode && (
            <div className="border-t border-emerald-200/60 pt-4">
              <p className="text-xs font-semibold text-emerald-800 mb-1">
                🔑 Option 2: Raw API Key (Developers Only — Shown ONCE)
              </p>
              <div className="flex items-center gap-2 bg-white rounded-xl border border-emerald-200 px-3 py-2">
                <code className="flex-1 text-xs text-gray-800 font-mono">
                  {showRawKey ? createdKeyInfo.raw_key : '•'.repeat(44)}
                </code>
                <button
                  onClick={() => setShowRawKey(!showRawKey)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  {showRawKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(createdKeyInfo.raw_key, 'key')}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1"
                >
                  {copiedKey ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Active Keys / Embeds List */}
      <Card title={`${devMode ? 'Active API Keys' : 'Your Website Chatbots'} (${keys.length}/5)`}>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8">
            <Key size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No chatbot keys created yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {keys.map((key) => (
              <div key={key.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-gray-100 gap-3 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                    <Key size={18} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800 text-sm">{key.name}</p>
                      <Badge label={key.is_active ? 'Active' : 'Revoked'} variant={key.is_active ? 'success' : 'gray'} />
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      Prefix: {key.key_prefix}•••••••• | Linked Docs: {key.document_ids?.length || 'All'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      const snippet = `<script\n  src="http://localhost:8000/static/widget.js"\n  data-key-id="${key.id}"\n  data-api-key="sk_live_..."\n  data-api-url="http://localhost:8000"\n></script>`
                      copyToClipboard(snippet, 'script')
                    }}
                    className="text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <Copy size={13} /> Copy Script Tag
                  </button>

                  {devMode && (
                    <span className="text-xs text-gray-400">{key.total_requests} requests</span>
                  )}

                  {key.is_active && (
                    <button onClick={() => revokeMutation.mutate(key.id)} className="text-xs text-amber-600 hover:underline font-medium">
                      Revoke
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(key.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Developer API Documentation (Only visible in Dev Mode) */}
      {devMode && (
        <Card title="Developer REST API Endpoint" className="mt-6">
          <p className="text-xs text-gray-500 mb-3">Call the chatbot endpoint programmatically using cURL or your server backend:</p>
          <pre className="bg-gray-900 text-green-400 rounded-xl p-4 text-xs font-mono overflow-x-auto">
{`POST /api/keys/chat/
Authorization: Api-Key sk_live_your_api_key_here
Content-Type: application/json

{
  "question": "What is this document about?"
}`}
          </pre>
        </Card>
      )}
    </DashboardLayout>
  )
}