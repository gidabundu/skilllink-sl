import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Building, ShieldCheck, MapPin, Globe } from 'lucide-react'
import { format } from 'date-fns'

export default async function AdminCompaniesPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/auth/login')

  const companies = await prisma.company.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      employer: true,
      _count: { select: { jobs: true } },
    },
  })

  const verified   = companies.filter(c => c.verified)
  const unverified = companies.filter(c => !c.verified)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-9 w-9 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
              <Building className="h-5 w-5 text-white" />
            </div>
            Company Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">All employer companies registered on the platform.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Companies',  value: companies.length, color: 'bg-secondary-50 border-secondary-200 text-secondary-800 shadow-sm' },
          { label: 'Verified',         value: verified.length,  color: 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm' },
          { label: 'Pending Review',   value: unverified.length, color: 'bg-amber-50 border-amber-100 text-amber-700 shadow-sm' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-sm font-bold mt-1 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Review Section */}
      {unverified.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-amber-200">
            <h2 className="font-extrabold text-amber-900 flex items-center gap-2">
              <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse"></span>
              Pending Verification ({unverified.length})
            </h2>
          </div>
          <div className="divide-y divide-amber-100">
            {unverified.map((company) => (
              <div key={company.id} className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 bg-white rounded-xl shadow-sm border border-amber-200 flex items-center justify-center font-black text-lg text-amber-700">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{company.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Rep: {company.employer.name} — {company.employer.email}</div>
                    {company.location && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3" />{company.location}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <form action={`/api/admin/companies/${company.id}/verify`} method="POST">
                    <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors">
                      ✓ Verify
                    </button>
                  </form>
                  <button className="px-4 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">
                    ✗ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Companies */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-extrabold text-slate-900">All Companies ({companies.length})</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {companies.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Building className="h-12 w-12 text-slate-200 mx-auto mb-3" />
              <p className="font-bold">No companies registered yet.</p>
            </div>
          ) : (
            companies.map((company) => (
              <div key={company.id} className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-secondary-100 rounded-xl flex items-center justify-center font-black text-xl text-secondary-700 shrink-0 border border-secondary-200">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {company.name}
                      {company.verified && (
                        <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{company.employer.email}</div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                      {company.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{company.location}</span>}
                      {company.website && <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{company.website}</span>}
                      <span>{company._count.jobs} jobs posted</span>
                      <span>Joined {format(new Date(company.createdAt), 'MMM yyyy')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 ${company.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {company.verified ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
