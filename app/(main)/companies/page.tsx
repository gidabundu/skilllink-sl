import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Building, MapPin, Briefcase, ExternalLink, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    where: { verified: true },
    include: {
      _count: {
        select: { jobs: { where: { status: 'ACTIVE' } } }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="bg-slate-50 min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Top Employers in Sierra Leone
          </h1>
          <p className="text-lg text-slate-600">
            Discover verified companies actively hiring on SkillLink SL. Explore their culture, open roles, and find your next great workplace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company) => (
            <div key={company.id} className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
              <div className="flex items-start justify-between mb-6">
                <div className="h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center font-bold text-2xl text-primary-600 border border-primary-100 shadow-sm">
                  {company.name.charAt(0)}
                </div>
                <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Verified
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-primary-600 transition-colors">
                {company.name}
              </h2>
              
              <div className="flex items-center text-slate-500 text-sm mb-4 space-x-4">
                {company.location && (
                  <span className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                    {company.location}
                  </span>
                )}
                {company.industry && (
                  <span className="flex items-center">
                    <Building className="h-4 w-4 mr-1 text-slate-400" />
                    {company.industry}
                  </span>
                )}
              </div>

              <p className="text-slate-600 text-sm mb-8 flex-grow line-clamp-3">
                {company.description || 'No description provided.'}
              </p>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
                <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-4 py-2 rounded-lg">
                  {company._count.jobs} Open Jobs
                </span>
                <Link href={`/jobs?search=${encodeURIComponent(company.name)}`} className="text-slate-500 hover:text-primary-600 transition-colors p-2">
                  <ExternalLink className="h-5 w-5" />
                </Link>
              </div>
            </div>
          ))}

          {companies.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-500">
              No companies have been verified yet. Check back soon!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
