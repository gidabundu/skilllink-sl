'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApplicationStatusSelect({
  applicationId,
  currentStatus,
}: {
  applicationId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value
    setLoading(true)

    try {
      const res = await fetch(`/api/employer/applications/${applicationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        console.error('Failed to update status')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={handleStatusChange}
      disabled={loading}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors outline-none cursor-pointer ${
        currentStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
        currentStatus === 'REVIEWING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
        currentStatus === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
        'bg-red-50 text-red-700 border-red-200'
      } ${loading ? 'opacity-50' : ''}`}
    >
      <option value="PENDING" className="bg-white text-slate-900">Pending</option>
      <option value="REVIEWING" className="bg-white text-slate-900">Reviewing</option>
      <option value="ACCEPTED" className="bg-white text-slate-900">Accepted</option>
      <option value="REJECTED" className="bg-white text-slate-900">Rejected</option>
    </select>
  )
}
