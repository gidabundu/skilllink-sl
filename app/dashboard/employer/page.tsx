import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Users, PlusCircle, Eye, Activity, TrendingUp, Calendar, AlertTriangle } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default async function EmployerDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'EMPLOYER') redirect('/auth/login')

  const company = await prisma.company.findUnique({ where: { employerId: user.id } })
  if (!company) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
        <p className="font-bold text-slate-600">Company profile not found.</p>
      </div>
    </div>
  )

  const [jobs, applicationsCount, recentApplications] = await Promise.all([
    prisma.job.findMany({
      where: { companyId: company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.count({ where: { job: { companyId: company.id } } }),
    prisma.application.findMany({
      where: { job: { companyId: company.id } },
      include: {
        seeker: true,
        job: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    })
  ])

  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0)
  const activeJobsCount = jobs.filter(j => j.status === 'ACTIVE').length

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    REVIEWED: 'bg-blue-100 text-blue-800',
    SHORTLISTED: 'bg-indigo-100 text-indigo-800',
    INTERVIEW: 'bg-purple-100 text-purple-800',
    HIRED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{company.name}</h1>
          <p className="text-slate-500 mt-1">Employer Dashboard — manage your job postings and talent pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/companies/${company.id}`}
            className="inline-flex items-center px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold text-sm transition-colors shadow-sm"
          >
            <Eye className="h-4 w-4 mr-2 text-slate-400" />
            View Public Profile
          </Link>
          <Link
            href="/dashboard/employer/post"
            className={`inline-flex items-center px-5 py-2.5 text-white rounded-xl font-bold text-sm transition-all shadow-lg ${
              company.verified
                ? 'bg-secondary-500 hover:bg-secondary-600 shadow-secondary-500/20 hover:-translate-y-0.5'
                : 'bg-slate-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Post New Job
          </Link>
        </div>
      </div>

      {/* Verification Warning */}
      {!company.verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900">Account Pending Verification</h3>
            <p className="text-sm text-amber-700 mt-0.5">Your employer account is under review. You'll be able to post jobs once an admin verifies your company. This usually takes 1–2 business days.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Active Jobs', value: activeJobsCount, icon: <Briefcase className="h-6 w-6" />, bg: 'bg-secondary-50', text: 'text-secondary-600', border: 'border-secondary-100' },
          { label: 'Total Applications', value: applicationsCount, icon: <Users className="h-6 w-6" />, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
          { label: 'Total Views', value: totalViews, icon: <Eye className="h-6 w-6" />, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
          { label: 'All Postings', value: jobs.length, icon: <Activity className="h-6 w-6" />, bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
        ].map((card) => (
          <div key={card.label} className={`bg-white rounded-2xl border ${card.border} shadow-sm p-6 flex items-center gap-4`}>
            <div className={`h-12 w-12 ${card.bg} rounded-2xl flex items-center justify-center shrink-0`}>
              <div className={card.text}>{card.icon}</div>
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">{card.label}</div>
              <div className={`text-3xl font-black ${card.text}`}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-extrabold text-slate-900 text-lg">Your Job Listings</h2>
            <Link href="/dashboard/employer/post" className="text-sm font-bold text-secondary-600 hover:text-secondary-700 transition-colors">
              + New Listing
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {jobs.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="font-bold text-slate-700 mb-1">No jobs posted yet</p>
                <p className="text-slate-400 text-sm">Post your first job to start attracting talent.</p>
              </div>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {format(new Date(job.createdAt), 'MMM d, yyyy')}</span>
                      <span className="flex items-center gap-1 text-secondary-600 font-bold"><Users className="h-3.5 w-3.5" /> {job._count.applications} applicants</span>
                      <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {job.views} views</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                      {job.status}
                    </span>
                    <Link href={`/dashboard/employer/jobs/${job.id}`} className="text-xs font-bold text-secondary-600 hover:text-secondary-700 bg-secondary-50 px-3 py-1.5 rounded-lg hover:bg-secondary-100 transition-colors">
                      Manage →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="font-extrabold text-slate-900 text-lg">Latest Applications</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {recentApplications.length === 0 ? (
              <div className="p-10 text-center">
                <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">No applications yet</p>
              </div>
            ) : (
              recentApplications.map((app) => (
                <div key={app.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 bg-secondary-100 text-secondary-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                      {app.seeker.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-slate-900 truncate">{app.seeker.name}</div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">{app.job.title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">{formatDistanceToNow(new Date(app.createdAt))} ago</span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${statusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentApplications.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 text-center">
              <Link href="/dashboard/employer/applications" className="text-sm font-bold text-secondary-600 hover:text-secondary-700">
                View all applications →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
