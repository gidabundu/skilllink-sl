import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, Search, Mail, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import ApplicationTableRow from './ApplicationTableRow'

export default async function EmployerApplicationsPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'EMPLOYER') {
    redirect('/auth/login')
  }

  const userId = (session.user as any).id

  const company = await prisma.company.findUnique({
    where: { employerId: userId },
  })

  if (!company) {
    redirect('/dashboard/employer')
  }

  const applications = await prisma.application.findMany({
    where: {
      job: {
        companyId: company.id
      }
    },
    include: {
      seeker: true,
      job: true,
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20 shrink-0">
          <FileText className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Applicant Management</h1>
          <p className="text-slate-500 text-sm mt-1">Review and manage applications for your active job listings.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900 text-lg">All Applications</h2>
          <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black">{applications.length} total</span>
        </div>

        {applications.length === 0 ? (
          <div className="p-12 text-center">
            <Search className="h-14 w-14 text-slate-200 mx-auto mb-4" />
            <p className="font-bold text-slate-700 mb-1 text-lg">No applicants yet</p>
            <p className="text-slate-400 text-sm mb-5">When users apply to your jobs, they will appear here.</p>
            <Link href="/dashboard/employer/post" className="inline-flex items-center px-5 py-2.5 bg-secondary-500 text-white rounded-xl font-bold text-sm hover:bg-secondary-600 transition-colors">
              Post a New Job
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Applied For</th>
                    <th className="px-6 py-4">Applied Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <ApplicationTableRow key={app.id} app={app} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden divide-y divide-slate-100">
              {applications.map((app) => (
                <ApplicationTableRow key={app.id} app={app} isMobile />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
