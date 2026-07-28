'use client'

import { useState } from 'react'
import { Share2, CheckCircle2 } from 'lucide-react'

interface Props {
  jobTitle: string
  companyName: string
}

export default function ShareJobButton({ jobTitle, companyName }: Props) {
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const title = `${jobTitle} at ${companyName} - SkillLink SL`

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Check out this job opportunity: ${jobTitle} at ${companyName}`,
          url,
        })
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(url)
        setShared(true)
        setTimeout(() => setShared(false), 2000)
      } catch (err) {
        console.error('Failed to copy to clipboard', err)
      }
    }
  }

  return (
    <button 
      onClick={handleShare}
      className={`bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-3 px-10 rounded-xl transition flex justify-center items-center gap-2 ${shared ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-50' : ''}`}
    >
      {shared ? (
        <>
          <CheckCircle2 className="h-4 w-4" /> Copied URL!
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" /> Share Job
        </>
      )}
    </button>
  )
}
