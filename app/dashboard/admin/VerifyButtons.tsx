'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function VerifyButtons({ companyId }: { companyId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/verify`, { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (loading || !confirm('Are you sure you want to reject and delete this company?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/companies/${companyId}/reject`, { method: 'POST' })
      if (res.ok) router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 transition-colors disabled:opacity-50"
      >
        ✓ Verify
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="px-4 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        ✗ Reject
      </button>
    </div>
  )
}
