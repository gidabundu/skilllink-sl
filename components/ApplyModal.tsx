'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, User, FileText, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Upload, Phone, Link as LinkIcon, Globe, AlertCircle } from 'lucide-react'

interface ApplyModalProps {
  jobId: string
  jobTitle: string
  companyName: string
  onClose: () => void
  onSuccess: () => void
}

interface UserProfile {
  name: string
  email: string
  phone?: string
  linkedIn?: string
  portfolio?: string
  cvPath?: string
  cvName?: string
}

export default function ApplyModal({ jobId, jobTitle, companyName, onClose, onSuccess }: ApplyModalProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedIn: '',
    portfolio: '',
    coverLetter: '',
    cvPath: '',
    cvName: '',
  })

  useEffect(() => {
    // Fetch pre-fill data
    fetch('/api/seeker/profile')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          const nameParts = (data.name || '').split(' ')
          setProfile(data)
          setFormData(prev => ({
            ...prev,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            email: data.email || '',
            phone: data.phone || '',
            linkedIn: data.linkedIn || '',
            portfolio: data.portfolio || '',
            cvPath: data.cvPath || '',
            cvName: data.cvName || '',
          }))
        }
      })
      .catch(() => {})
  }, [])

  const totalSteps = 4
  const steps = ['Personal Info', 'Cover Letter', 'Resume / CV', 'Review & Submit']

  async function handleCvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    setUploadingCv(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFormData(prev => ({ ...prev, cvPath: data.cvPath, cvName: data.cvName }))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploadingCv(false)
      e.target.value = ''
    }
  }

  async function handleSubmit() {
    if (!formData.coverLetter.trim()) {
      setError('A cover letter is required.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          linkedIn: formData.linkedIn,
          portfolio: formData.portfolio,
          coverLetter: formData.coverLetter,
          cvPath: formData.cvPath,
          cvName: formData.cvName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Application failed')
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    if (step === 1) {
      return formData.firstName.trim() && formData.lastName.trim() && formData.email.trim() && formData.phone.trim()
    }
    if (step === 2) {
      return formData.coverLetter.trim().length >= 100
    }
    if (step === 3) {
      return !!formData.cvPath
    }
    return true
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-8 py-6 flex items-start justify-between shrink-0 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-secondary-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-secondary-400 text-xs font-bold uppercase tracking-widest mb-1">Applying for</p>
            <h2 className="text-xl font-black text-white leading-tight">{jobTitle}</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">{companyName}</p>
          </div>
          <button onClick={onClose} className="relative z-10 h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors shrink-0">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-8 pt-6 pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className={`flex items-center gap-2 ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                    i + 1 < step ? 'bg-emerald-500 text-white' :
                    i + 1 === step ? 'bg-secondary-500 text-white shadow-md shadow-secondary-500/30' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {i + 1 < step ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${i + 1 < step ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step {step} of {totalSteps} — <span className="text-secondary-600">{steps[step - 1]}</span>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Personal Information</h3>
                <p className="text-sm text-slate-500">This information will be included with your application. We've pre-filled what we know about you.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">First Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={formData.firstName}
                      onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                      placeholder="John"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Last Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={formData.lastName}
                      onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                    placeholder="+232 76 123 456"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">LinkedIn <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={formData.linkedIn}
                      onChange={e => setFormData(p => ({ ...p, linkedIn: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                      placeholder="linkedin.com/in/..."
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Portfolio <span className="text-slate-400 font-normal normal-case">(optional)</span></label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={formData.portfolio}
                      onChange={e => setFormData(p => ({ ...p, portfolio: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition"
                      placeholder="yourportfolio.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Cover Letter */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Cover Letter</h3>
                <p className="text-sm text-slate-500">Write a compelling cover letter explaining why you're the perfect fit for this role. Minimum 100 characters.</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">Your Cover Letter *</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={e => setFormData(p => ({ ...p, coverLetter: e.target.value }))}
                  rows={12}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-secondary-400/50 focus:border-secondary-400 transition resize-none leading-relaxed"
                  placeholder={`Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${companyName}...\n\nIn my previous experience, I have...\n\nI am excited about this opportunity because...\n\nThank you for considering my application.\n\nSincerely,\n${formData.firstName} ${formData.lastName}`}
                />
                <div className="flex justify-between items-center text-xs text-slate-400 font-medium mt-1">
                  <span>{formData.coverLetter.length >= 100 ? '✓ Minimum length met' : `${Math.max(0, 100 - formData.coverLetter.length)} more characters required`}</span>
                  <span>{formData.coverLetter.length} characters</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Resume */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Resume / CV</h3>
                <p className="text-sm text-slate-500">Attach your most up-to-date resume. Employers will be able to download and review it.</p>
              </div>

              {formData.cvName && formData.cvPath ? (
                <div className="p-5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-emerald-100 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{formData.cvName}</p>
                      <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-0.5"><CheckCircle2 className="h-3 w-3" /> Ready to attach</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-slate-500 hover:text-secondary-600 transition"
                  >
                    Replace
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-secondary-400 rounded-2xl p-10 text-center cursor-pointer transition-colors group hover:bg-secondary-50/50"
                >
                  <div className="h-16 w-16 bg-slate-100 group-hover:bg-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 group-hover:text-secondary-500 transition-colors" />
                  </div>
                  <p className="font-bold text-slate-700 mb-1">Upload your Resume / CV</p>
                  <p className="text-sm text-slate-400">Click to browse — PDF or DOCX, max 5MB</p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleCvUpload} />

              {uploadingCv && (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <Loader2 className="h-5 w-5 text-secondary-500 animate-spin" />
                  <span className="text-sm font-bold text-slate-600">Uploading file...</span>
                </div>
              )}

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs font-medium text-amber-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <span>A CV or Resume is <strong>required</strong> for all job applications. Please upload your document to proceed.</span>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-1">Review Your Application</h3>
                <p className="text-sm text-slate-500">Please take a moment to review your information before submitting.</p>
              </div>

              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
                <div className="p-4 bg-slate-50">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Personal Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span></div>
                    <div><span className="text-slate-500">Email:</span> <span className="font-bold text-slate-900">{formData.email}</span></div>
                    <div><span className="text-slate-500">Phone:</span> <span className="font-bold text-slate-900">{formData.phone || '—'}</span></div>
                    {formData.linkedIn && <div><span className="text-slate-500">LinkedIn:</span> <span className="font-bold text-slate-900 truncate block">{formData.linkedIn}</span></div>}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Cover Letter</p>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed line-clamp-4">{formData.coverLetter || <span className="text-red-500 italic">No cover letter written!</span>}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Resume / CV</p>
                  {formData.cvName ? (
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" /> {formData.cvName}
                    </div>
                  ) : (
                    <p className="text-sm text-amber-600 font-bold">⚠ No CV attached</p>
                  )}
                </div>
              </div>

              <div className="bg-secondary-50 border border-secondary-200 rounded-xl p-4 text-sm text-secondary-800 font-medium">
                By submitting, you agree to share your information with <strong>{companyName}</strong> for the purposes of this job application.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50">
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : onClose()}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 transition"
          >
            <ChevronLeft className="h-4 w-4" /> {step > 1 ? 'Back' : 'Cancel'}
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`rounded-full transition-all ${i + 1 === step ? 'w-4 h-1.5 bg-secondary-500' : 'w-1.5 h-1.5 bg-slate-300'}`} />
            ))}
          </div>

          {step < totalSteps ? (
            <button
              onClick={() => { setError(''); setStep(s => s + 1) }}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-secondary-500 text-white hover:bg-secondary-600 transition shadow-md shadow-secondary-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            >
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm bg-gradient-to-r from-secondary-500 to-amber-500 text-white hover:from-secondary-600 hover:to-amber-600 transition shadow-lg shadow-secondary-500/30 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Application <CheckCircle2 className="h-4 w-4" /></>}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
