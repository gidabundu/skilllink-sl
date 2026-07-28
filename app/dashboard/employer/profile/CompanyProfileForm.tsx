'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, Building } from 'lucide-react'

const DISTRICTS = [
  'Bo', 'Bombali', 'Bonthe', 'Falaba', 'Kailahun', 'Kambia', 'Karene',
  'Kenema', 'Koinadugu', 'Kono', 'Moyamba', 'Port Loko', 'Pujehun',
  'Tonkolili', 'Western Area Rural', 'Western Area Urban',
]

const INDUSTRIES = [
  'Technology', 'Finance & Banking', 'Healthcare', 'Education', 'Mining & Resources',
  'Agriculture', 'Construction', 'Telecommunications', 'NGO / Non-profit',
  'Government', 'Retail & Commerce', 'Media & Communications', 'Hospitality & Tourism', 'Other',
]

const SIZES = ['1-10', '11-50', '50-100', '100-500', '500+']

interface CompanyProfileFormProps {
  company: {
    id: string
    name: string
    description: string | null
    industry: string | null
    size: string | null
    location: string | null
    website: string | null
    verified: boolean
  }
}

export default function CompanyProfileForm({ company }: CompanyProfileFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: company.name || '',
    description: company.description || '',
    industry: company.industry || '',
    size: company.size || '',
    location: company.location || '',
    website: company.website || '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/employer/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.ok) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update profile.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 bg-secondary-50 rounded-xl flex items-center justify-center">
            <Building className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">Company Information</h2>
            <p className="text-xs text-slate-400">This information is displayed publicly on your company profile.</p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
              placeholder="e.g. Freetown Tech Solutions"
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
            <select
              name="industry"
              value={form.industry}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
            >
              <option value="">Select industry...</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
            <select
              name="size"
              value={form.size}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
            >
              <option value="">Select size...</option>
              {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Location (District)</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
            >
              <option value="">Select district...</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
              placeholder="https://yourcompany.com"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Company Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all resize-none"
              placeholder="Tell job seekers about your company — your mission, culture, and what makes you a great place to work..."
            />
            <p className="text-xs text-slate-400 mt-1">{form.description.length} / 1000 characters</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div>
            {success && <p className="text-emerald-600 font-bold text-sm flex items-center gap-2">✓ Profile updated successfully!</p>}
            {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-2.5 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-all shadow-md shadow-secondary-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </form>
  )
}
