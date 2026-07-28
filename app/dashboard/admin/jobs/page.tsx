import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Briefcase, MapPin, Users, Calendar, Eye } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'

export default async function AdminJobsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/auth/login')

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  })

  const activeJobs = jobs.filter(j => j.status === 'ACTIVE')
  const closedJobs = jobs.filter(j => j.status !== 'ACTIVE')

  const statusBadge: Record<string, string> = {
    ACTIVE:  'bg-emerald-100 text-emerald-800',
    CLOSED:  'bg-slate-100 text-slate-600',
    DRAFT:   'bg-amber-100 text-amber-700',
    EXPIRED: 'bg-red-100 text-red-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-9 w-9 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            Job Moderation
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">Review and moderate all job listings on the platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Jobs',   value: jobs.length,       color: 'bg-secondary-50 border-secondary-200 text-secondary-800 shadow-sm' },
          { label: 'Active',       value: activeJobs.length, color: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' },
          { label: 'Closed/Draft', value: closedJobs.length, color: 'bg-slate-100 border-slate-200 text-slate-700 shadow-sm' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-sm font-bold mt-1 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">All Job Listings ({jobs.length})</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {jobs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Briefcase className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="font-bold">No jobs posted yet.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-secondary-100 rounded-xl flex items-center justify-center font-black text-secondary-700 shrink-0 border border-secondary-200">
                        {job.company.name.charAt(0)}
                      </div>
                      <div>
                        <Link href={`/jobs/${job.id}`} className="font-bold text-slate-900 hover:text-secondary-600 transition-colors">
                          {job.title}
                        </Link>
                        <div className="text-sm font-semibold text-secondary-600 mt-0.5">{job.company.name}</div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1.5">
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{job.location}</span>
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{job._count.applications} applicants</span>
                          <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{job.views} views</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-13 sm:ml-0">
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-black ${statusBadge[job.status] || 'bg-slate-100 text-slate-600'}`}>
                      {job.status}
                    </span>
                    <Link href={`/jobs/${job.id}`} className="text-xs font-bold text-secondary-600 hover:text-secondary-700 bg-secondary-50 px-3 py-1.5 rounded-lg hover:bg-secondary-100 transition-colors border border-secondary-200">
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
