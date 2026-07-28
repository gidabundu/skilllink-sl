'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, FileText, CheckCircle2, XCircle, Mail, Globe, Link as LinkIcon, Phone } from 'lucide-react'

interface ReviewApplicationModalProps {
  application: any
  onClose: () => void
}

export default function ReviewApplicationModal({ application, onClose }: ReviewApplicationModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Parse notes to get extra info if available
  let applicantNotes: any = {}
  try {
    applicantNotes = JSON.parse(application.notes || '{}')
  } catch (e) {
    // Ignore parse errors
  }

  const updateStatus = async (status: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employer/applications/${application.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        router.refresh()
        onClose()
      } else {
        console.error('Failed to update status')
        setLoading(false)
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-start justify-between bg-slate-50 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-900">Review Application</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Applying for {application.job.title}</p>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8">
          
          {/* Applicant Info */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Applicant Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block text-xs font-bold mb-1">Full Name</span>
                <span className="font-bold text-slate-900">{applicantNotes.firstName || application.seeker.name} {applicantNotes.lastName || ''}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-bold mb-1">Email</span>
                <span className="font-bold flex items-center gap-1 text-slate-900"><Mail className="h-3 w-3" /> {application.seeker.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-bold mb-1">Phone</span>
                <span className="font-bold flex items-center gap-1 text-slate-900"><Phone className="h-3 w-3" /> {applicantNotes.phone || application.seeker.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs font-bold mb-1">LinkedIn</span>
                <span className="font-bold flex items-center gap-1 text-slate-900"><LinkIcon className="h-3 w-3" /> {applicantNotes.linkedIn || application.seeker.linkedIn || 'Not provided'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block text-xs font-bold mb-1">Portfolio</span>
                <span className="font-bold flex items-center gap-1 text-slate-900"><Globe className="h-3 w-3" /> {applicantNotes.portfolio || application.seeker.portfolio || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Cover Letter</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
              {application.coverLetter}
            </div>
          </div>

          {/* Resume / CV */}
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Resume / CV</h3>
            {application.cvPath ? (
              <a 
                href={application.cvPath} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors group"
              >
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 group-hover:text-emerald-700 transition-colors">{application.cvName || 'Resume.pdf'}</p>
                  <p className="text-xs text-emerald-600 font-medium">Click to view or download</p>
                </div>
              </a>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm font-medium text-amber-800">
                No CV was attached to this application.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50 shrink-0">
          <button
            onClick={() => updateStatus('REJECTED')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-white border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <XCircle className="h-4 w-4" /> Reject
          </button>
          
          <button
            onClick={() => updateStatus('ACCEPTED')}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" /> Accept Candidate
          </button>
        </div>
      </div>
    </div>
  )
}
