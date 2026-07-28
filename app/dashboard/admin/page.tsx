import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ShieldCheck, Users, Briefcase, FileText, Building, TrendingUp, Clock, CheckCircle, Activity } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import VerifyButtons from './VerifyButtons'
import Link from 'next/link'

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'ADMIN') redirect('/auth/login')

  const [stats, unverifiedCompanies, recentUsers, recentJobs, recentApplications] = await Promise.all([
    prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SEEKER' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.application.count(),
      prisma.company.count({ where: { verified: false } }),
    ]),
    prisma.company.findMany({
      where: { verified: false },
      include: { employer: true },
      orderBy: { createdAt: 'asc' },
      take: 5,
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // Activity feed: recent jobs + recent applications
    prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { company: { select: { name: true } } },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        seeker: { select: { name: true } },
        job: { select: { title: true } },
      },
    }),
  ])

  const [totalUsers, totalSeekers, totalEmployers, activeJobs, totalApplications, pendingVerifications] = stats

  // Build unified activity feed
  type ActivityItem = { type: string; text: string; time: Date; color: string; dot: string }
  const activityFeed: ActivityItem[] = [
    ...recentJobs.map(j => ({
      type: 'job',
      text: `${j.company.name} posted a new job: "${j.title}"`,
      time: new Date(j.createdAt),
      color: 'text-secondary-700',
      dot: 'bg-secondary-400',
    })),
    ...recentApplications.map(a => ({
      type: 'application',
      text: `${a.seeker.name} applied for "${a.job.title}"`,
      time: new Date(a.createdAt),
      color: 'text-blue-700',
      dot: 'bg-blue-400',
    })),
    ...recentUsers.map(u => ({
      type: 'user',
      text: `${u.name} joined as ${u.role.toLowerCase()}`,
      time: new Date(u.createdAt),
      color: 'text-emerald-700',
      dot: 'bg-emerald-400',
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 12)

  const statCards = [
    { label: 'Total Users', value: totalUsers, icon: <Users className="h-6 w-6" />, color: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-600' },
    { label: 'Job Seekers', value: totalSeekers, icon: <Users className="h-6 w-6" />, color: 'bg-indigo-500', light: 'bg-indigo-50', text: 'text-indigo-600' },
    { label: 'Employers', value: totalEmployers, icon: <Building className="h-6 w-6" />, color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
    { label: 'Active Jobs', value: activeJobs, icon: <Briefcase className="h-6 w-6" />, color: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
    { label: 'Applications', value: totalApplications, icon: <FileText className="h-6 w-6" />, color: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-600' },
    { label: 'Pending Verify', value: pendingVerifications, icon: <Clock className="h-6 w-6" />, color: 'bg-red-500', light: 'bg-red-50', text: 'text-red-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Panel</h1>
          </div>
          <p className="text-slate-500 mt-1 ml-14">Welcome back, {user.name}. Here's your platform overview.</p>
        </div>
        <div className="text-right text-sm text-slate-400 font-medium">
          <div>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>

      {/* Sleek Inline Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-6 overflow-x-auto">
        {statCards.map((card, idx) => (
          <div key={card.label} className={`flex items-center gap-3 min-w-fit ${idx !== statCards.length - 1 ? 'pr-6 border-r border-slate-100' : ''}`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${card.light}`}>
              <div className={card.text}>{card.icon}</div>
            </div>
            <div>
              <div className={`text-xl font-black leading-none mb-1 ${card.text}`}>{card.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Verifications */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
              <span className="h-2 w-2 bg-amber-500 rounded-full inline-block"></span>
              Pending Employer Verifications
            </h2>
            <span className="text-xs font-black bg-amber-100 text-amber-700 px-3 py-1 rounded-full">{pendingVerifications} pending</span>
          </div>
          <div className="divide-y divide-slate-50">
            {unverifiedCompanies.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                <p className="font-bold text-slate-700">All companies verified!</p>
                <p className="text-slate-400 text-sm mt-1">No pending verifications at this time.</p>
              </div>
            ) : (
              unverifiedCompanies.map((company) => (
                <div key={company.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-secondary-100 rounded-xl flex items-center justify-center font-black text-lg text-secondary-600 shrink-0">
                      {company.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{company.name}</div>
                      <div className="text-sm text-slate-500">{company.employer.name} — {company.employer.email}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Location: {company.location || 'Not specified'}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <VerifyButtons companyId={company.id} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users & Quick Actions */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <span className="h-2 w-2 bg-emerald-500 rounded-full inline-block"></span>
                Recently Joined
              </h2>
            </div>
            <div className="divide-y divide-slate-50">
              {recentUsers.map((u) => (
                <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-slate-50 transition-colors">
                  <div className="h-9 w-9 bg-secondary-100 rounded-full flex items-center justify-center font-bold text-secondary-600 shrink-0 text-sm">
                    {u.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{u.name}</div>
                    <div className="text-xs text-slate-400 truncate">{u.email}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto shrink-0 ${
                    u.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                    u.role === 'EMPLOYER' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-xl relative border border-slate-800">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-500 rounded-full filter blur-[80px] opacity-20 pointer-events-none"></div>
            <div className="p-6 relative z-10">
              <h2 className="font-extrabold text-white text-lg mb-5">Quick Actions</h2>
              <div className="space-y-3">
                {[
                  { label: 'Manage All Users',     href: '/dashboard/admin/users',     icon: <Users className="h-4 w-4" /> },
                  { label: 'Moderate Job Listings', href: '/dashboard/admin/jobs',      icon: <Briefcase className="h-4 w-4" /> },
                  { label: 'View All Companies',    href: '/dashboard/admin/companies', icon: <Building className="h-4 w-4" /> },
                  { label: 'Analytics & Reports',   href: '/dashboard/admin/analytics', icon: <TrendingUp className="h-4 w-4" /> },
                ].map((item) => (
                  <Link key={item.label} href={item.href} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white font-bold text-sm group">
                    <div className="text-secondary-400">{item.icon}</div>
                    {item.label}
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mt-6 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary-500" />
            Platform Activity Log
          </h2>
          <span className="text-xs font-black bg-slate-100 text-slate-600 px-3 py-1 rounded-full">Live</span>
        </div>
        <div className="p-6">
          {activityFeed.length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-semibold">
              No recent activity to display.
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
              <div className="space-y-5">
                {activityFeed.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 pl-6 relative">
                    <div className={`absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${item.dot}`}></div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${item.color}`}>{item.text}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(item.time, { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
