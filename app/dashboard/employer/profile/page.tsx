import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ShieldCheck, Globe, MapPin, Building } from 'lucide-react'
import CompanyProfileForm from './CompanyProfileForm'

export const dynamic = 'force-dynamic'

export default async function EmployerProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth/login')

  const user = session.user as any
  if (user.role !== 'EMPLOYER') redirect('/auth/login')

  const company = await prisma.company.findUnique({ where: { employerId: user.id } })
  if (!company) redirect('/dashboard/employer')

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Company Profile</h1>
        <p className="text-slate-500 mt-1">Keep your company information up to date to attract the best talent.</p>
      </div>

      {/* Verification Badge */}
      <div className={`rounded-2xl p-5 mb-8 flex items-center gap-4 border ${
        company.verified
          ? 'bg-emerald-50 border-emerald-200'
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
          company.verified ? 'bg-emerald-100' : 'bg-amber-100'
        }`}>
          <ShieldCheck className={`h-5 w-5 ${company.verified ? 'text-emerald-600' : 'text-amber-600'}`} />
        </div>
        <div>
          <h3 className={`font-bold ${company.verified ? 'text-emerald-900' : 'text-amber-900'}`}>
            {company.verified ? '✓ Verified Company' : 'Pending Verification'}
          </h3>
          <p className={`text-sm mt-0.5 ${company.verified ? 'text-emerald-700' : 'text-amber-700'}`}>
            {company.verified
              ? 'Your company is verified. Job seekers will see the verified badge on your profile.'
              : 'Your company is under review by our admin team. Verification usually takes 1–2 business days.'}
          </p>
        </div>
      </div>

      {/* Quick Info Strip */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-8 flex flex-wrap items-center gap-6">
        {company.location && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">{company.location}</span>
          </div>
        )}
        {company.industry && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Building className="h-4 w-4 text-slate-400" />
            <span className="font-semibold">{company.industry}</span>
          </div>
        )}
        {company.website && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Globe className="h-4 w-4 text-slate-400" />
            <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-semibold text-secondary-600 hover:underline">
              {company.website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
      </div>

      {/* Edit Form */}
      <CompanyProfileForm company={company} />
    </div>
  )
}
