'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { CheckCircle2 } from 'lucide-react'

const ApplyModal = dynamic(() => import('./ApplyModal'), { ssr: false })

interface Props {
  jobId: string
  jobTitle: string
  companyName: string
  hasApplied?: boolean
  isSeeker?: boolean
}

export default function ApplyButton({ jobId, jobTitle, companyName, hasApplied = false, isSeeker = false }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [submitted, setSubmitted] = useState(hasApplied)
  const router = useRouter()

  if (submitted) {
    return (
      <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold py-3.5 px-6 rounded-xl text-sm">
        <CheckCircle2 className="h-5 w-5" />
        Application Submitted
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => isSeeker ? setShowModal(true) : router.push('/auth/login?from=' + encodeURIComponent(`/jobs/${jobId}`))}
        className="bg-secondary-500 hover:bg-secondary-400 text-primary-950 font-bold py-3.5 px-10 rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] transform hover:-translate-y-0.5 text-center"
      >
        Apply Now
      </button>

      {showModal && (
        <ApplyModal
          jobId={jobId}
          jobTitle={jobTitle}
          companyName={companyName}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false)
            setSubmitted(true)
          }}
        />
      )}
    </>
  )
}
