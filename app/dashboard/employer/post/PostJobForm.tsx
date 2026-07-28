'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PostJobForm({ categories }: { categories: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      location: formData.get('location'),
      type: formData.get('type'),
      salary: formData.get('salary'),
      categoryId: formData.get('categoryId'),
      description: formData.get('description'),
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to post job')

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard/employer')
        router.refresh()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-bold">
          ✅ Job posted successfully! Redirecting to your dashboard...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Job Title</label>
          <input
            name="title"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900"
            placeholder="e.g. Senior Frontend Developer"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Location</label>
          <select
            name="location"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900"
          >
            <option value="">-- Select a district --</option>
            <option value="Bo">Bo</option>
            <option value="Bombali">Bombali</option>
            <option value="Bonthe">Bonthe</option>
            <option value="Falaba">Falaba</option>
            <option value="Kailahun">Kailahun</option>
            <option value="Kambia">Kambia</option>
            <option value="Karene">Karene</option>
            <option value="Kenema">Kenema</option>
            <option value="Koinadugu">Koinadugu</option>
            <option value="Kono">Kono</option>
            <option value="Moyamba">Moyamba</option>
            <option value="Port Loko">Port Loko</option>
            <option value="Pujehun">Pujehun</option>
            <option value="Tonkolili">Tonkolili</option>
            <option value="Western Area Rural">Western Area Rural</option>
            <option value="Western Area Urban">Western Area Urban</option>
            <option value="Remote">Remote</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Employment Type</label>
          <select
            name="type"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900"
          >
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="FREELANCE">Freelance</option>
            <option value="INTERNSHIP">Internship</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Category</label>
          <select
            name="categoryId"
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900"
          >
            <option value="">-- Select a category --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Salary Range <span className="text-slate-400 font-normal">(Optional)</span></label>
          <input
            name="salary"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900"
            placeholder="e.g. $80k - $100k or Competitive"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-bold text-slate-700">Job Description & Requirements</label>
          <textarea
            name="description"
            required
            rows={10}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500/50 transition-all font-medium text-slate-900 resize-none"
            placeholder="Describe the role, responsibilities, and qualifications required..."
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-all shadow-lg shadow-secondary-500/20 disabled:opacity-50 flex items-center"
        >
          {loading ? 'Posting Job...' : 'Post Job Listing'}
        </button>
      </div>
    </form>
  )
}
