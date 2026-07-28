import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, MapPin, Building, Calendar, CheckCircle, Clock, XCircle, Search, User, Star } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import ResumeUpload from './ResumeUpload'

export default async function SeekerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'SEEKER') redirect('/auth/login')

  const [profile, applications] = await Promise.all([
    prisma.seekerProfile.findUnique({ where: { userId: user.id } }),
    prisma.application.findMany({
      where: { seekerId: user.id },
      include: {
        job: { include: { company: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  ])

  const statusConfig: Record<string, { color: string, icon: React.ReactNode, label: string }> = {
    PENDING:     { color: 'bg-amber-100 text-amber-800',   icon: <Clock className="h-3.5 w-3.5" />,        label: 'Pending' },
    REVIEWED:    { color: 'bg-blue-100 text-blue-800',     icon: <FileText className="h-3.5 w-3.5" />,     label: 'Reviewed' },
    SHORTLISTED: { color: 'bg-indigo-100 text-indigo-800', icon: <Star className="h-3.5 w-3.5" />,         label: 'Shortlisted' },
    INTERVIEW:   { color: 'bg-purple-100 text-purple-800', icon: <Calendar className="h-3.5 w-3.5" />,     label: 'Interview' },
    HIRED:       { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle className="h-3.5 w-3.5" />, label: 'Hired 🎉' },
    REJECTED:    { color: 'bg-red-100 text-red-700',       icon: <XCircle className="h-3.5 w-3.5" />,      label: 'Rejected' },
  }

  const pendingCount = applications.filter(a => a.status === 'PENDING').length
  const interviewCount = applications.filter(a => a.status === 'INTERVIEW').length
  const hiredCount = applications.filter(a => a.status === 'HIRED').length

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Track your applications and manage your career journey.</p>
        </div>
        <Link
          href="/jobs"
          className="inline-flex items-center px-5 py-2.5 bg-secondary-500 text-white rounded-xl hover:bg-secondary-600 font-bold text-sm transition-all shadow-lg shadow-secondary-500/20 hover:-translate-y-0.5"
        >
          <Search className="h-4 w-4 mr-2" />
          Find New Jobs
        </Link>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Applied', value: applications.length, color: 'text-secondary-600', bg: 'bg-secondary-50 border-secondary-100' },
          { label: 'Interviews Scheduled', value: interviewCount, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-100' },
          { label: 'Offers Received', value: hiredCount, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100' },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border p-5 flex items-center gap-4 ${s.bg}`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.value}</div>
            <div className={`text-sm font-bold ${s.color} opacity-80`}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-secondary-500" />
              My Applications
            </h2>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">{applications.length} total</span>
          </div>

          <div className="divide-y divide-slate-50">
            {applications.length === 0 ? (
              <div className="p-14 text-center">
                <Search className="h-14 w-14 text-slate-200 mx-auto mb-4" />
                <p className="font-bold text-slate-700 mb-1 text-lg">No applications yet</p>
                <p className="text-slate-400 text-sm mb-5">Browse jobs and start your career journey today.</p>
                <Link href="/jobs" className="inline-flex items-center px-5 py-2.5 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-colors">
                  Browse Jobs →
                </Link>
              </div>
            ) : (
              applications.map((app) => {
                const st = statusConfig[app.status] || { color: 'bg-slate-100 text-slate-600', icon: null, label: app.status }
                return (
                  <div key={app.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <Link href={`/jobs/${app.jobId}`} className="font-bold text-slate-900 hover:text-secondary-600 transition-colors text-base">
                          {app.job.title}
                        </Link>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400" /> {app.job.company.name}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {app.job.location}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Applied {formatDistanceToNow(new Date(app.createdAt))} ago</span>
                        </div>
                        {app.status === 'INTERVIEW' && app.interviewAt && (
                          <div className="mt-2 text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            Interview: {format(new Date(app.interviewAt), 'MMM d, yyyy h:mm a')}
                          </div>
                        )}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black shrink-0 ${st.color}`}>
                        {st.icon}
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Profile Sidebar */}
        <div className="space-y-5">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-br from-secondary-500 to-amber-500 p-6 text-white text-center">
              <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3 border border-white/30">
                {user.name.charAt(0)}
              </div>
              <h3 className="font-black text-lg">{user.name}</h3>
              <p className="text-amber-100 text-sm mt-0.5 font-medium">{user.email}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Location</div>
                <div className="text-sm font-bold text-slate-700">{profile?.location || <span className="text-slate-400 font-normal italic">Not set</span>}</div>
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Bio</div>
                <div className="text-sm text-slate-600 leading-relaxed">{profile?.bio || <span className="text-slate-400 italic">No bio added yet.</span>}</div>
              </div>
              <div>
                <div className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {profile?.skills && JSON.parse(profile.skills).length > 0 ? (
                    JSON.parse(profile.skills).map((skill: string, i: number) => (
                      <span key={i} className="bg-secondary-50 text-secondary-700 text-xs px-2.5 py-1 rounded-lg font-bold border border-secondary-100">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-400 italic">No skills added</span>
                  )}
                </div>
              </div>
              <Link href="/dashboard/seeker/profile" className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors">
                <User className="h-4 w-4" /> Edit Profile
              </Link>
            </div>
          </div>

          {/* Tip card */}
          <div className="bg-gradient-to-br from-amber-100 to-secondary-200 rounded-2xl p-5 text-secondary-900 border border-secondary-300/30">
            <div className="font-black text-base mb-1">💡 Career Tip</div>
            <p className="text-sm font-medium leading-relaxed opacity-90">
              Profiles with a complete bio and listed skills get <strong>3x more recruiter views</strong>. Update your profile to stand out!
            </p>
            <Link href="/dashboard/seeker/profile" className="mt-3 inline-flex items-center text-sm font-black hover:underline">
              Complete Profile →
            </Link>
          </div>
          
          {/* Resume Upload Component */}
          <ResumeUpload initialCvName={profile?.cvName || null} initialCvPath={profile?.cvPath || null} />
        </div>
      </div>
    </div>
  )
}
