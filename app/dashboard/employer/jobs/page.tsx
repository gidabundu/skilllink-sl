import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, Users, Eye, PlusCircle, Calendar, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function EmployerJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'EMPLOYER') redirect('/auth/login')

  const company = await prisma.company.findUnique({ where: { employerId: user.id } })
  if (!company) redirect('/dashboard/employer')

  const jobs = await prisma.job.findMany({
    where: { companyId: company.id },
    include: {
      _count: { select: { applications: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE').length
  const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0)
  const totalViews = jobs.reduce((sum, j) => sum + j.views, 0)

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Jobs</h1>
          <p className="text-slate-500 mt-1">Manage all your job listings for {company.name}.</p>
        </div>
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

      {/* Verification Warning */}
      {!company.verified && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 flex items-start gap-4">
          <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-bold text-amber-900">Account Pending Verification</h3>
            <p className="text-sm text-amber-700 mt-0.5">Your employer account is under review. You'll be able to post jobs once an admin verifies your company.</p>
          </div>
        </div>
      )}

      {/* Summary Strip */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-6 overflow-x-auto">
        {[
          { label: 'Total Listings', value: jobs.length, color: 'text-slate-800' },
          { label: 'Active Jobs', value: activeJobs, color: 'text-emerald-600' },
          { label: 'Total Applications', value: totalApplications, color: 'text-secondary-600' },
          { label: 'Total Views', value: totalViews, color: 'text-blue-600' },
        ].map((item, idx, arr) => (
          <div key={item.label} className={`flex items-center gap-3 min-w-fit ${idx !== arr.length - 1 ? 'pr-6 border-r border-slate-100' : ''}`}>
            <div>
              <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900 text-lg">All Job Listings</h2>
        </div>

        {jobs.length === 0 ? (
          <div className="p-16 text-center">
            <Briefcase className="h-14 w-14 text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-700 text-lg mb-2">No jobs posted yet</p>
            <p className="text-slate-400 text-sm mb-6">Post your first job to start attracting top talent in Sierra Leone.</p>
            <Link href="/dashboard/employer/post" className="inline-flex items-center px-6 py-3 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-colors shadow-lg shadow-secondary-500/20">
              <PlusCircle className="h-4 w-4 mr-2" /> Post a Job
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {jobs.map((job) => (
              <div key={job.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-slate-900 group-hover:text-secondary-700 transition-colors truncate">{job.title}</h3>
                    <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-black ${
                      job.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      job.status === 'CLOSED' ? 'bg-slate-100 text-slate-600' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Posted {format(new Date(job.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-secondary-600">
                      <Users className="h-3.5 w-3.5" />
                      {job._count.applications} applicants
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" />
                      {job.views} views
                    </span>
                    <span className="capitalize">{job.type.replace('_', ' ').toLowerCase()}</span>
                    <span>{job.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    View Public
                  </Link>
                  <Link
                    href={`/dashboard/employer/applications?job=${job.id}`}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    View Apps ({job._count.applications})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
