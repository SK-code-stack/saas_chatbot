import { useEffect, useState } from 'react'
import { FileText, Key, MessageSquare, TrendingUp } from 'lucide-react'
import api from '../../lib/axios'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import DashboardLayout from '../../components/layout/DashboardLayout'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({ documents: 0, apiKeys: 0, sessions: 0 })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docs, keys, sessions] = await Promise.all([
          api.get('/api/documents/'),
          api.get('/api/keys/list_keys/'),
          api.get('/api/chatbot/sessions/'),
        ])
        setStats({
          documents: docs.data.results?.length || docs.data.length || 0,
          apiKeys: keys.data.length || 0,
          sessions: sessions.data.length || 0,
        })
      } catch {}
    }
    fetchStats()
  }, [])

  const statCards = [
    { label: 'Documents', value: stats.documents, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'API Keys', value: stats.apiKeys, icon: Key, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: 'Chat Sessions', value: stats.sessions, icon: MessageSquare, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Total Requests', value: 0, icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50' },
  ]

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.first_name} 👋</h1>
        <p className="text-gray-500 mt-1">Here's your chatbot platform overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={color} size={22} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Quick Start">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Upload Documents', desc: 'Upload your PDF, Word, or Excel files', href: '/documents' },
            { step: '2', title: 'Get API Key', desc: 'Generate a key for your integration', href: '/api-keys' },
            { step: '3', title: 'Start Chatting', desc: 'Test your chatbot in the chat playground', href: '/chat' },
          ].map(({ step, title, desc, href }) => (
            <a key={step} href={href} className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group">
              <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {step}
              </div>
              <div>
                <p className="font-medium text-gray-800 group-hover:text-primary-600">{title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
            </a>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  )
}