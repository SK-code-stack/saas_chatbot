import { useState, useRef } from 'react'
import { Upload, FileText, Trash2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import api from '../../lib/axios'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'

const statusVariant = {
  completed: 'success', processing: 'warning',
  pending: 'info', failed: 'error'
}

export default function Documents() {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef(null)
  const queryClient = useQueryClient()

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/api/documents/')
      return res.data.results || res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/api/documents/${id}/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      toast.success('Document deleted')
    }
  })

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)
    try {
      await api.post('/api/documents/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Document uploaded and processed!')
      queryClient.invalidateQueries({ queryKey: ['documents'] })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-500 mt-1">Upload files to power your chatbot</p>
        </div>
        <div>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.xlsx" onChange={handleUpload} className="hidden" />
          <Button onClick={() => fileRef.current?.click()} loading={uploading}>
            <Upload size={16} className="mr-2" /> Upload File
          </Button>
        </div>
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center mb-6 cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-all"
      >
        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500">Click to upload or drag and drop</p>
        <p className="text-xs text-gray-400 mt-1">PDF, DOCX, XLSX up to 10MB</p>
      </div>

      <Card title={`Documents (${documents.length})`}>
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400">No documents yet. Upload your first file.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FileText size={18} className="text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{doc.title}</p>
                    <p className="text-xs text-gray-400">
                      {doc.file_type?.toUpperCase()} · {formatSize(doc.file_size)} · {doc.chunk_count} chunks
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={doc.status} variant={statusVariant[doc.status]} />
                  <button onClick={() => deleteMutation.mutate(doc.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  )
}