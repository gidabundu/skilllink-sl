'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2, User, MapPin, Briefcase, GraduationCap, Globe, Link2, Plus, X } from 'lucide-react'

const DISTRICTS = [
  'Bo', 'Bombali', 'Bonthe', 'Falaba', 'Kailahun', 'Kambia', 'Karene',
  'Kenema', 'Koinadugu', 'Kono', 'Moyamba', 'Port Loko', 'Pujehun',
  'Tonkolili', 'Western Area Rural', 'Western Area Urban',
]

interface SeekerProfileFormProps {
  profile: {
    bio: string | null
    location: string | null
    skills: string
    experience: string | null
    education: string | null
    linkedIn: string | null
    portfolio: string | null
  } | null
  userName: string
  userEmail: string
}

export default function SeekerProfileForm({ profile, userName, userEmail }: SeekerProfileFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const parsedSkills: string[] = (() => {
    try { return JSON.parse(profile?.skills || '[]') } catch { return [] }
  })()

  const [form, setForm] = useState({
    bio: profile?.bio || '',
    location: profile?.location || '',
    experience: profile?.experience || '',
    education: profile?.education || '',
    linkedIn: profile?.linkedIn || '',
    portfolio: profile?.portfolio || '',
  })
  const [skills, setSkills] = useState<string[]>(parsedSkills)
  const [skillInput, setSkillInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed) && skills.length < 20) {
      setSkills(prev => [...prev, trimmed])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(prev => prev.filter(s => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/seeker/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills }),
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="h-9 w-9 bg-secondary-50 rounded-xl flex items-center justify-center">
            <User className="h-5 w-5 text-secondary-600" />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-400">Your profile is visible to verified employers.</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
            <input type="text" value={userName} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
            <p className="text-xs text-slate-400 mt-1">Name cannot be changed here.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input type="email" value={userEmail} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-slate-400" />Location (District)
            </label>
            <select name="location" value={form.location} onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all">
              <option value="">Select district...</option>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-bold text-slate-700 mb-2">Bio / About You</label>
            <textarea name="bio" value={form.bio} onChange={handleChange} rows={4}
              placeholder="Tell employers about yourself, your strengths, and your career goals..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">Skills</h2>
          <p className="text-xs text-slate-400 mt-0.5">Add up to 20 skills. Press Enter or click + to add.</p>
        </div>
        <div className="p-6">
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              placeholder="e.g. Microsoft Excel, Customer Service..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all"
            />
            <button type="button" onClick={addSkill}
              className="px-4 py-3 bg-secondary-500 text-white rounded-xl font-bold hover:bg-secondary-600 transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="inline-flex items-center gap-1.5 bg-secondary-50 text-secondary-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-secondary-100">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="text-secondary-400 hover:text-red-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {skills.length === 0 && <span className="text-sm text-slate-400 italic">No skills added yet.</span>}
          </div>
        </div>
      </div>

      {/* Experience & Education */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">Experience & Education</h2>
        </div>
        <div className="p-6 grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Briefcase className="w-3.5 h-3.5 inline mr-1 text-slate-400" />Work Experience
            </label>
            <textarea name="experience" value={form.experience} onChange={handleChange} rows={4}
              placeholder="e.g. 2 years as a Sales Representative at XYZ Company (2022–2024)..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all resize-none" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <GraduationCap className="w-3.5 h-3.5 inline mr-1 text-slate-400" />Education
            </label>
            <textarea name="education" value={form.education} onChange={handleChange} rows={3}
              placeholder="e.g. BSc Computer Science, Fourah Bay College (2018–2022)..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all resize-none" />
          </div>
        </div>
      </div>

      {/* Online Presence */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">Online Presence</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Globe className="w-3.5 h-3.5 inline mr-1 text-slate-400" />LinkedIn Profile URL
            </label>
            <input type="url" name="linkedIn" value={form.linkedIn} onChange={handleChange}
              placeholder="https://linkedin.com/in/yourname"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              <Globe className="w-3.5 h-3.5 inline mr-1 text-slate-400" />Portfolio / Website
            </label>
            <input type="url" name="portfolio" value={form.portfolio} onChange={handleChange}
              placeholder="https://yourportfolio.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent transition-all" />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-4">
        <div>
          {success && <p className="text-emerald-600 font-bold text-sm">✓ Profile updated successfully!</p>}
          {error && <p className="text-red-600 font-bold text-sm">{error}</p>}
        </div>
        <button type="submit" disabled={saving}
          className="inline-flex items-center px-6 py-2.5 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-all shadow-md shadow-secondary-500/20 disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Mobile bottom padding */}
      <div className="h-20 lg:h-0" />
    </form>
  )
}
