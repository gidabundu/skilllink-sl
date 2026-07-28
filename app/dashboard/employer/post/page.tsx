import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import PostJobForm from './PostJobForm'
import { Briefcase } from 'lucide-react'

export default async function PostJobPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'EMPLOYER') {
    redirect('/auth/login')
  }

  const company = await prisma.company.findUnique({
    where: { employerId: (session.user as any).id },
  })

  if (!company || !company.verified) {
    redirect('/dashboard/employer')
  }

  const categories = [
    { id: 'IT & Software', name: 'IT & Software' },
    { id: 'Design & Creative', name: 'Design & Creative' },
    { id: 'Sales & Marketing', name: 'Sales & Marketing' },
    { id: 'Engineering & Architecture', name: 'Engineering & Architecture' },
    { id: 'Business & Management', name: 'Business & Management' },
    { id: 'Finance & Accounting', name: 'Finance & Accounting' },
    { id: 'Education & Training', name: 'Education & Training' },
    { id: 'Healthcare & Medical', name: 'Healthcare & Medical' },
    { id: 'Customer Service', name: 'Customer Service' },
    { id: 'Other', name: 'Other' },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-10 w-10 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Post a New Job</h1>
          <p className="text-slate-500 text-sm mt-1">Fill out the details below to list a new opportunity on SkillLink SL.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-8">
        <PostJobForm categories={categories} />
      </div>
    </div>
  )
}
