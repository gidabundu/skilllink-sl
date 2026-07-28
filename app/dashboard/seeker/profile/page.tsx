import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { User } from 'lucide-react'
import SeekerProfileForm from './SeekerProfileForm'
import ResumeUpload from '../ResumeUpload'

export const dynamic = 'force-dynamic'

export default async function SeekerProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'SEEKER') redirect('/auth/login')

  const profile = await prisma.seekerProfile.findUnique({ where: { userId: user.id } })

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 bg-secondary-100 rounded-xl flex items-center justify-center">
            <User className="h-5 w-5 text-secondary-600" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Profile</h1>
        </div>
        <p className="text-slate-500 ml-14">
          Keep your profile up to date to increase your chances of getting hired.
        </p>
      </div>

      {/* Profile Completeness */}
      {(() => {
        const fields = [profile?.bio, profile?.location, profile?.experience, profile?.education, profile?.cvPath]
        const filled = fields.filter(Boolean).length
        const pct = Math.round((filled / fields.length) * 100)
        return (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-slate-700">Profile Completeness</span>
              <span className={`font-black text-lg ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-secondary-600' : 'text-amber-600'}`}>{pct}%</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-secondary-500' : 'bg-amber-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {pct < 100 ? 'Complete your profile to attract more employers.' : 'Your profile is complete!'}
            </p>
          </div>
        )
      })()}

      {/* Resume Upload */}
      <div className="mb-6">
        <ResumeUpload initialCvName={profile?.cvName || null} initialCvPath={profile?.cvPath || null} />
      </div>

      {/* Edit Form */}
      <SeekerProfileForm
        profile={profile}
        userName={user.name}
        userEmail={user.email}
      />
    </div>
  )
}
