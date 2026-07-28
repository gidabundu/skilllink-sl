'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Building, User, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Register() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get('role') === 'employer' ? 'EMPLOYER' : 'SEEKER'

  const [step, setStep] = useState(1)
  const [role, setRole] = useState(initialRole)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', companyName: '', companyDescription: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Registration failed')
      }
      router.push('/auth/login?registered=true')
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-6 group">
          <div className="relative w-16 h-16 overflow-hidden rounded-2xl bg-white shadow-xl shadow-primary-500/10 border border-slate-100 flex items-center justify-center p-2 transform transition-transform group-hover:scale-105">
            <Image src="/logo.png" alt="SkillLink SL Logo" width={48} height={48} className="object-contain" />
          </div>
          <span className="font-black text-2xl text-slate-900 tracking-tight">SkillLink SL</span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          {step === 1 ? 'Create an account' : 'Your details'}
        </h2>
        <p className="text-center text-slate-500 text-sm">
          {step === 1 ? 'Select your account type to begin.' : 'Fill in the form below to get started.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px] relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-10 px-6 shadow-2xl shadow-slate-200/50 sm:rounded-3xl sm:px-12 border border-white/50">
          
          {/* Progress bar */}
          <div className="flex gap-2 mb-8">
            <div className="h-1.5 flex-1 rounded-full bg-primary-600 shadow-sm" />
            <div className={`h-1.5 flex-1 rounded-full transition-colors shadow-sm ${step >= 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
          </div>

          {error && (
            <div className="mb-6 bg-red-50/80 border border-red-200 text-red-700 text-sm font-medium rounded-xl px-4 py-3 flex items-start gap-3 backdrop-blur-sm">
              <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {[
                { r: 'SEEKER', icon: <User className="h-5 w-5" />, label: "I'm a Job Seeker", sub: 'Looking for my next career opportunity.' },
                { r: 'EMPLOYER', icon: <Building className="h-5 w-5" />, label: "I'm an Employer", sub: 'Looking to hire exceptional talent.' },
              ].map(({ r, icon, label, sub }) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`w-full flex items-center p-5 border-2 rounded-2xl transition-all text-left group ${
                    role === r
                      ? r === 'SEEKER'
                        ? 'border-primary-600 bg-primary-50 shadow-md shadow-primary-500/10'
                        : 'border-secondary-500 bg-secondary-50 shadow-md shadow-secondary-500/10'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 mr-4 transition-colors ${
                    role === r
                      ? r === 'SEEKER' ? 'bg-primary-600 text-white' : 'bg-secondary-500 text-white'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 text-base">{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </div>
                  {role === r && (
                    <CheckCircle2 className={`h-6 w-6 shrink-0 ml-3 ${r === 'SEEKER' ? 'text-primary-600' : 'text-secondary-500'}`} />
                  )}
                </button>
              ))}

              <button
                onClick={() => setStep(2)}
                className="w-full mt-6 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-900/20 transform hover:-translate-y-0.5"
              >
                Continue
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'John Doe', isTextarea: false },
                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'john@example.com', isTextarea: false },
                ...(role === 'EMPLOYER' ? [
                  { label: 'Company Name', name: 'companyName', type: 'text', placeholder: 'Acme Corp', isTextarea: false },
                  { label: 'Company Bio', name: 'companyDescription', type: 'text', placeholder: 'Tell us about your company...', isTextarea: true }
                ] : []),
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters', isTextarea: false },
              ].map(({ label, name, type, placeholder, isTextarea }) => (
                <div key={name}>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{label}</label>
                  {isTextarea ? (
                    <textarea
                      required
                      placeholder={placeholder}
                      value={(formData as any)[name]}
                      onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all shadow-sm resize-none"
                    />
                  ) : (
                    <input
                      type={type}
                      required
                      minLength={name === 'password' ? 6 : undefined}
                      placeholder={placeholder}
                      value={(formData as any)[name]}
                      onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-slate-900 placeholder-slate-400 transition-all shadow-sm"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-60 shadow-xl shadow-primary-500/20 transform hover:-translate-y-0.5"
                >
                  {isLoading ? 'Creating account…' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-bold uppercase tracking-wider text-xs">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm transform hover:-translate-y-0.5">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </button>
              <button className="w-full inline-flex justify-center items-center py-3 px-4 border border-slate-200 rounded-xl bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm transform hover:-translate-y-0.5">
                <svg className="h-5 w-5 mr-2 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </button>
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-center text-sm text-slate-600 font-medium">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-bold text-primary-700 hover:text-primary-800 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
