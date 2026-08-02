import { useState } from 'react'
import { Send, MessageSquare } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'

export default function Chat() {
  const [selectedDocs, setSelectedDocs] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)

  const { data: documents = [] } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents/')
      return res.data.results || res.data
    }
  })

  const readyDocs = documents.filter(d => d.is_ready)

  const toggleDoc = (id) => {
    setSelectedDocs(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    )
  }

  const startSession = async () => {
    if (!selectedDocs.length) return toast.error('Select at least one document')
    try {
      const res = await api.post('/api/chatbot/start_session/', {
        document_ids: selectedDocs,
        title: 'Playground Chat'
      })
      setSessionId(res.data.session_id)
      setMessages([])
      toast.success('Session started!')
    } catch {
      toast.error('Failed to start session')
    }
  }

  const sendMessage = async () => {
    if (!question.trim() || !sessionId) return
    const userMsg = question.trim()
    setQuestion('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const res = await api.post(`/api/chatbot/${sessionId}/ask/`, { question: userMsg })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch {
      toast.error('Failed to get response')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Chat Playground</h1>
        <p className="text-gray-500 mt-1">Test your chatbot with your documents</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card title="Setup">
            <p className="text-sm text-gray-500 mb-3">Select documents:</p>
            <div className="flex flex-col gap-2 mb-4">
              {readyDocs.length === 0 ? (
                <p className="text-sm text-gray-400">No ready documents yet.</p>
              ) : readyDocs.map(doc => (
                <label key={doc.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDocs.includes(doc.id)}
                    onChange={() => toggleDoc(doc.id)}
                    className="accent-primary-500"
                  />
                  <span className="text-sm text-gray-700">{doc.title}</span>
                </label>
              ))}
            </div>
            <Button onClick={startSession} fullWidth disabled={!selectedDocs.length}>
              {sessionId ? 'Restart Session' : 'Start Chat'}
            </Button>
          </Card>
        </div>

        <div className="col-span-2">
          <Card className="h-[600px] flex flex-col p-0 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-800">Chat</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300">
                  <MessageSquare size={48} className="mb-3" />
                  <p>Start a session and ask a question</p>
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${msg.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-gray-500 animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={sessionId ? 'Ask a question...' : 'Start a session first'}
                disabled={!sessionId || loading}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 disabled:bg-gray-50"
              />
              <Button onClick={sendMessage} disabled={!sessionId || loading || !question.trim()}>
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}