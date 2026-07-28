import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { BarChart3, TrendingUp, Users, Briefcase, FileText, Building } from 'lucide-react'

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/auth/login')

  const [
    totalUsers, totalSeekers, totalEmployers, totalAdmins,
    totalJobs, activeJobs, closedJobs,
    totalApplications,
    totalCompanies, verifiedCompanies,
    applicationsByStatus,
    jobsByCategory,
    recentApplications,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'SEEKER' } }),
    prisma.user.count({ where: { role: 'EMPLOYER' } }),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.job.count({ where: { status: { not: 'ACTIVE' } } }),
    prisma.application.count(),
    prisma.company.count(),
    prisma.company.count({ where: { verified: true } }),
    prisma.application.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.job.groupBy({ by: ['category'], _count: { _all: true }, orderBy: { _count: { id: 'desc' } } }),
    prisma.application.findMany({
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: { seeker: true, job: { select: { title: true, company: { select: { name: true } } } } },
    }),
  ])

  const statusColors: Record<string, string> = {
    PENDING:     'bg-amber-500',
    REVIEWED:    'bg-blue-500',
    SHORTLISTED: 'bg-indigo-500',
    INTERVIEW:   'bg-purple-500',
    HIRED:       'bg-emerald-500',
    REJECTED:    'bg-red-500',
  }
  const statusLabels: Record<string, string> = {
    PENDING: 'Pending', REVIEWED: 'Reviewed', SHORTLISTED: 'Shortlisted',
    INTERVIEW: 'Interview', HIRED: 'Hired', REJECTED: 'Rejected',
  }

  const maxAppCount = Math.max(...applicationsByStatus.map(a => a._count._all), 1)
  const maxJobCount = Math.max(...jobsByCategory.map(j => j._count._all), 1)

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <div className="h-9 w-9 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          Analytics & Reports
        </h1>
        <p className="text-slate-500 text-sm mt-1 ml-12">Real-time platform statistics. All data reflects your actual database.</p>
      </div>

      {/* Sleek Inline Stats */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-6 overflow-x-auto">
        {[
          { label: 'Users',           value: totalUsers,        sub: `${totalSeekers} seekers, ${totalEmployers} employers`, icon: <Users className="h-5 w-5" />, text: 'text-secondary-600', light: 'bg-secondary-50' },
          { label: 'Jobs',            value: totalJobs,         sub: `${activeJobs} active`,                                 icon: <Briefcase className="h-5 w-5" />, text: 'text-emerald-600', light: 'bg-emerald-50' },
          { label: 'Apps',            value: totalApplications, sub: 'total submitted',                                      icon: <FileText className="h-5 w-5" />, text: 'text-purple-600', light: 'bg-purple-50' },
          { label: 'Companies',       value: totalCompanies,    sub: `${verifiedCompanies} verified`,                        icon: <Building className="h-5 w-5" />, text: 'text-amber-600', light: 'bg-amber-50' },
        ].map((card, idx) => (
          <div key={card.label} className={`flex items-center gap-4 min-w-fit ${idx !== 3 ? 'pr-6 border-r border-slate-100' : ''}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${card.light} ${card.text}`}>
              {card.icon}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <div className={`text-2xl font-black leading-none ${card.text}`}>{card.value}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.label}</div>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Applications by Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
          <h2 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-secondary-600" />
            Applications by Status
          </h2>
          {applicationsByStatus.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No applications yet.</div>
          ) : (
            <div className="space-y-3">
              {applicationsByStatus.map((item) => (
                <div key={item.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-700">{statusLabels[item.status] || item.status}</span>
                    <span className="font-black text-slate-900">{item._count._all}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[item.status] || 'bg-slate-400'}`}
                      style={{ width: `${(item._count._all / maxAppCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Jobs by Category */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
          <h2 className="font-extrabold text-slate-900 mb-5 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-secondary-600" />
            Jobs by Category
          </h2>
          {jobsByCategory.length === 0 ? (
            <div className="text-center text-slate-400 py-8">No jobs yet.</div>
          ) : (
            <div className="space-y-3">
              {jobsByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-bold text-slate-700">{item.category || 'Uncategorized'}</span>
                    <span className="font-black text-slate-900">{item._count._all}</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-secondary-500"
                      style={{ width: `${(item._count._all / maxJobCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 overflow-x-auto">
          <h2 className="font-extrabold text-slate-900 mb-4">User Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Job Seekers', value: totalSeekers,   pct: totalUsers > 0 ? Math.round((totalSeekers / totalUsers) * 100) : 0,   color: 'bg-secondary-500' },
              { label: 'Employers',   value: totalEmployers, pct: totalUsers > 0 ? Math.round((totalEmployers / totalUsers) * 100) : 0, color: 'bg-purple-500' },
              { label: 'Admins',      value: totalAdmins,    pct: totalUsers > 0 ? Math.round((totalAdmins / totalUsers) * 100) : 0,    color: 'bg-red-400' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold text-slate-700">{item.label}</span>
                  <span className="font-black text-slate-900">{item.value} <span className="text-slate-400 font-normal">({item.pct}%)</span></span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Verification Rate */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <h2 className="font-extrabold text-slate-900 mb-4 self-start">Verification Rate</h2>
          <div className="relative w-32 h-32 my-2">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9155" fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray={`${totalCompanies > 0 ? (verifiedCompanies / totalCompanies) * 100 : 0} 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-secondary-700">
                {totalCompanies > 0 ? Math.round((verifiedCompanies / totalCompanies) * 100) : 0}%
              </span>
            </div>
          </div>
          <p className="text-slate-500 text-sm mt-2">{verifiedCompanies} of {totalCompanies} companies verified</p>
        </div>

        {/* Quick Stats */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800">
          <h2 className="font-extrabold mb-5 text-lg text-secondary-400">Platform Health</h2>
          <div className="space-y-4">
            {[
              { label: 'Avg applications per job', value: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : '0' },
              { label: 'Active job fill rate', value: `${activeJobs} open roles` },
              { label: 'Unverified companies', value: `${totalCompanies - verifiedCompanies} pending` },
            ].map((s) => (
              <div key={s.label} className="flex justify-between items-center py-2.5 border-b border-white/10 last:border-0">
                <span className="text-slate-300 text-sm">{s.label}</span>
                <span className="font-black text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Applications Feed */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">Recent Application Activity</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {recentApplications.length === 0 ? (
            <div className="p-10 text-center text-slate-400">No applications recorded yet.</div>
          ) : (
            recentApplications.map((app) => (
              <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center font-black text-sm shrink-0 border border-secondary-200">
                    {app.seeker.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{app.seeker.name}</span>
                    <span className="text-slate-400 text-xs mx-2">applied to</span>
                    <span className="font-bold text-secondary-700 text-sm">{app.job.title}</span>
                    <div className="text-xs text-slate-400 mt-0.5">at {app.job.company.name}</div>
                  </div>
                </div>
                <span className={`text-xs font-black px-3 py-1 rounded-full text-white ${statusColors[app.status] || 'bg-slate-400'}`}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
