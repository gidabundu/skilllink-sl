import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MapPin, Briefcase, Building, Clock, Calendar, ChevronLeft, ShieldCheck, DollarSign, FileText, Activity } from 'lucide-react'
import ShareJobButton from '@/components/ShareJobButton'
import { formatDistanceToNow, format } from 'date-fns'
import ApplyButton from '@/components/ApplyButton'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function JobDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const job = await prisma.job.findUnique({
    where: { id: resolvedParams.id },
    include: { company: true },
  })

  if (!job) notFound()

  const session = await getServerSession(authOptions)
  const user = session?.user as any
  const isSeeker = user?.role === 'SEEKER'
  let hasApplied = false

  if (isSeeker) {
    const existingApp = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId: job.id,
          seekerId: user.id
        }
      }
    })
    hasApplied = !!existingApp
  }

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-28 pb-12 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/jobs" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-secondary-600 mb-8 transition group">
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to all jobs
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-secondary-50 border-2 border-secondary-100 flex items-center justify-center font-black text-3xl text-secondary-600 shadow-lg shrink-0">
                {job.company.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">{job.title}</h1>
                <div className="flex items-center text-lg text-secondary-600 font-bold mb-4">
                  <Building className="h-5 w-5 mr-2" />
                  {job.company.name}
                  {job.company.verified && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center text-sm text-slate-500 gap-x-5 gap-y-2">
                  <span className="flex items-center"><MapPin className="h-4 w-4 mr-1 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center"><Briefcase className="h-4 w-4 mr-1 text-slate-400" /> {job.type.replace('_', ' ')}</span>
                  <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> Posted {formatDistanceToNow(new Date(job.createdAt))} ago</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto shrink-0">
              <ApplyButton jobId={job.id} jobTitle={job.title} companyName={job.company.name} hasApplied={hasApplied} isSeeker={isSeeker} />
              <ShareJobButton jobTitle={job.title} companyName={job.company.name} />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-slate-200">
              <h2 className="text-2xl font-black text-slate-900 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                <FileText className="h-6 w-6 text-secondary-500" /> Job Description
              </h2>
              <div className="text-slate-600 leading-loose whitespace-pre-line text-lg font-medium">
                {job.description}
              </div>

              {job.requirements && (
                <>
                  <h2 className="text-2xl font-black text-slate-900 mt-12 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-secondary-500" /> Requirements
                  </h2>
                  <div className="text-slate-600 leading-loose whitespace-pre-line text-lg font-medium">
                    {job.requirements}
                  </div>
                </>
              )}

              {job.benefits && (
                <>
                  <h2 className="text-2xl font-black text-slate-900 mt-12 mb-6 pb-4 border-b border-slate-100 flex items-center gap-2">
                    <DollarSign className="h-6 w-6 text-secondary-500" /> Benefits & Perks
                  </h2>
                  <div className="text-slate-600 leading-loose whitespace-pre-line text-lg font-medium">
                    {job.benefits}
                  </div>
                </>
              )}
            </div>

            {/* Apply CTA at bottom */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-secondary-500 rounded-full filter blur-[100px] opacity-30 pointer-events-none"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-2">Ready to apply?</h3>
                <p className="text-slate-300 text-base font-medium">Don't miss out – submit your application today.</p>
              </div>
              <div className="relative z-10">
                <ApplyButton jobId={job.id} jobTitle={job.title} companyName={job.company.name} hasApplied={hasApplied} isSeeker={isSeeker} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100 text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-secondary-500" /> Job Overview
              </h3>

              <ul className="space-y-5">
                {job.salaryMin && job.salaryMax ? (
                  <li className="flex items-start">
                    <div className="h-10 w-10 bg-secondary-50 rounded-xl flex items-center justify-center shrink-0 mr-4 border border-secondary-100">
                      <DollarSign className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Salary Range</div>
                      <div className="text-sm font-bold text-slate-900">
                        Le {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                      </div>
                    </div>
                  </li>
                ) : null}

                <li className="flex items-start">
                  <div className="h-10 w-10 bg-secondary-50 rounded-xl flex items-center justify-center shrink-0 mr-4 border border-secondary-100">
                    <Briefcase className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Employment Type</div>
                    <div className="text-sm font-bold text-slate-900 capitalize">{job.type.replace('_', ' ').toLowerCase()}</div>
                  </div>
                </li>

                <li className="flex items-start">
                  <div className="h-10 w-10 bg-secondary-50 rounded-xl flex items-center justify-center shrink-0 mr-4 border border-secondary-100">
                    <MapPin className="h-5 w-5 text-secondary-600" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="text-sm font-bold text-slate-900">{job.location}</div>
                  </div>
                </li>

                {job.deadline && (
                  <li className="flex items-start">
                    <div className="h-10 w-10 bg-red-50 rounded-xl flex items-center justify-center shrink-0 mr-4">
                      <Calendar className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Application Deadline</div>
                      <div className="text-sm font-bold text-red-600">{format(new Date(job.deadline), 'MMMM d, yyyy')}</div>
                    </div>
                  </li>
                )}
              </ul>
            </div>

            {/* Company card */}
            <div className="bg-gradient-to-br from-secondary-500 to-amber-500 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden border border-secondary-400/50">
              <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white rounded-full filter blur-[80px] opacity-20 pointer-events-none"></div>
              <h3 className="font-extrabold mb-5 pb-4 border-b border-white/20 text-lg relative z-10 flex items-center gap-2">
                <Building className="h-5 w-5" /> About the Company
              </h3>
              <div className="relative z-10">
                <div className="font-black text-2xl text-white mb-4">{job.company.name}</div>
                <p className="text-sm text-secondary-50 mb-8 leading-relaxed font-medium">
                  {job.company.description || 'No description provided.'}
                </p>
                <Link
                  href={`/companies`}
                  className="inline-flex items-center text-sm font-black text-secondary-900 bg-white px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-lg shadow-black/5"
                >
                  View Company Profile →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
