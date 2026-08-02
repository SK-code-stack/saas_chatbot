import { useState } from 'react'
import { Key, Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react'
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
  const [createdKey, setCreatedKey] = useState(null)
  const [showKey, setShowKey] = useState(false)
  const queryClient = useQueryClient()

  const { data: keys = [], isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await api.get('/api/keys/list_keys/')
      return res.data
    }
  })

  const createMutation = useMutation({
    mutationFn: (name) => api.post('/api/keys/create_key/', { name }),
    onSuccess: (res) => {
      setCreatedKey(res.data.raw_key)
      setNewKeyName('')
      queryClient.invalidateQueries({ queryKey: ['api-keys'] })
      toast.success('API key created!')
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed')
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

  const copyKey = (key) => {
    navigator.clipboard.writeText(key)
    toast.success('Copied!')
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 mt-1">Manage keys for developer integration</p>
      </div>

      <Card title="Create New Key" className="mb-6">
        <div className="flex gap-3">
          <Input
            placeholder="Key name e.g. Production, My Website"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1"
          />
          <Button
            onClick={() => createMutation.mutate(newKeyName)}
            loading={createMutation.isPending}
            disabled={!newKeyName.trim()}
          >
            <Plus size={16} className="mr-1" /> Create
          </Button>
        </div>
      </Card>

      {createdKey && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Save this key now — it will never be shown again!
          </p>
          <div className="flex items-center gap-2 bg-white rounded-lg border border-yellow-200 px-3 py-2">
            <code className="flex-1 text-sm text-gray-800 font-mono">
              {showKey ? createdKey : '•'.repeat(40)}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="text-gray-400 hover:text-gray-600">
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
            <button onClick={() => copyKey(createdKey)} className="text-gray-400 hover:text-primary-500">
              <Copy size={16} />
            </button>
          </div>
          <button onClick={() => setCreatedKey(null)} className="text-xs text-yellow-600 mt-2 hover:underline">
            I've saved my key, dismiss
          </button>
        </div>
      )}

      <Card title={`Your Keys (${keys.length}/5)`}>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8">
            <Key size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No API keys yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <Key size={18} className="text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{key.name}</p>
                    <p className="text-xs text-gray-400 font-mono">{key.key_prefix}••••••••</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{key.total_requests} requests</span>
                  <Badge label={key.is_active ? 'Active' : 'Revoked'} variant={key.is_active ? 'success' : 'gray'} />
                  {key.is_active && (
                    <button onClick={() => revokeMutation.mutate(key.id)} className="text-xs text-orange-500 hover:underline">
                      Revoke
                    </button>
                  )}
                  <button onClick={() => deleteMutation.mutate(key.id)} className="text-gray-300 hover:text-red-500">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="How to use your API key" className="mt-6">
        <p className="text-sm text-gray-500 mb-3">Call the chat API with your key:</p>
        <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`POST /api/keys/chat/
Authorization: Api-Key sk_live_your_key_here
Content-Type: application/json

{
  "question": "What is this document about?",
  "document_ids": [1, 2]
}`}
        </pre>
        <p className="text-sm text-gray-500 mt-4 mb-3">Or embed the widget:</p>
        <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs overflow-x-auto">
{`<script
  src="https://yourdomain.com/widget.js"
  data-key="sk_live_your_key_here"
  data-docs="1,2"
  data-color="#6366f1"
  data-name="Support Bot"
></script>`}
        </pre>
      </Card>
    </DashboardLayout>
  )
}