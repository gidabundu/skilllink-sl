'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileUp, FileText, CheckCircle2, Loader2 } from 'lucide-react'

export default function ResumeUpload({ initialCvName, initialCvPath }: { initialCvName: string | null, initialCvPath: string | null }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Limit to PDF or DOCX, and max 5MB for example
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB')
      return
    }

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Upload failed')
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mt-6">
      <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2">
        <FileUp className="h-5 w-5 text-secondary-500" />
        Resume / CV
      </h3>
      
      {error && <div className="text-red-500 text-sm mb-3 font-bold">{error}</div>}

      {initialCvName && initialCvPath ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 border border-secondary-100 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-secondary-200 text-secondary-700 flex items-center justify-center rounded-lg">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">{initialCvName}</p>
              <p className="text-xs text-secondary-600 font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="h-3 w-3" /> Uploaded successfully
              </p>
            </div>
          </div>
          <a 
            href={initialCvPath} 
            target="_blank" 
            rel="noreferrer"
            className="text-sm font-bold text-secondary-700 bg-white px-4 py-2 rounded-lg border border-secondary-200 hover:bg-secondary-100 transition-colors text-center"
          >
            View PDF
          </a>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-slate-500">You haven't uploaded a resume yet. Adding a resume increases your chances of getting hired!</p>
        </div>
      )}

      <label className={`relative block w-full border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 hover:border-secondary-300 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} disabled={uploading} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 text-secondary-500 animate-spin" />
            <span className="text-sm font-bold text-slate-600">Uploading...</span>
          </div>
        ) : (
          <div>
            <div className="mx-auto h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <FileUp className="h-6 w-6 text-slate-400" />
            </div>
            <span className="text-sm font-bold text-secondary-600 hover:text-secondary-700">Click to upload</span>
            <span className="text-sm text-slate-500"> or drag and drop</span>
            <p className="text-xs text-slate-400 mt-1">PDF, DOCX up to 5MB</p>
          </div>
        )}
      </label>
    </div>
  )
}
