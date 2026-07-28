import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Briefcase, MapPin, Clock, Search, Filter, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function JobsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams
  const search = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : ''
  const category = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : ''
  const location = typeof resolvedSearchParams.location === 'string' ? resolvedSearchParams.location : ''

  const where: any = { status: 'ACTIVE' }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
      { company: { name: { contains: search } } },
    ]
  }
  if (category) where.category = category
  if (location) where.location = { contains: location }

  const jobs = await prisma.job.findMany({
    where,
    include: { company: true },
    orderBy: { createdAt: 'desc' },
  })

  const categories = ['Technology', 'Finance & Banking', 'Healthcare', 'NGO & Non-Profit', 'Engineering', 'Education', 'Agriculture']
  const hasActiveFilters = search || category || location

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Banner */}
      <div className="bg-primary-950 pt-28 pb-16 px-4 sm:px-6 lg:px-8 text-center text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Explore Opportunities
          </h1>
          <p className="text-primary-200 mb-10 max-w-2xl mx-auto text-lg">
            Find your next role among hundreds of open positions in Sierra Leone.
          </p>

          <form className="flex flex-col md:flex-row gap-3" action="/jobs">
            <div className="flex-1 bg-white rounded-xl flex items-center px-5 py-4 shadow-xl">
              <Search className="h-5 w-5 text-primary-400 mr-3 shrink-0" />
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Job title, skills, or company…"
                className="w-full focus:outline-none bg-transparent text-slate-800 text-base placeholder-slate-400"
              />
            </div>
            <div className="flex-1 bg-white rounded-xl flex items-center px-5 py-4 shadow-xl">
              <MapPin className="h-5 w-5 text-primary-400 mr-3 shrink-0" />
              <select
                name="location"
                defaultValue={location}
                className="w-full focus:outline-none bg-transparent text-slate-800 text-base cursor-pointer appearance-none"
              >
                <option value="">Any Location</option>
                <option value="Bo">Bo</option>
                <option value="Bombali">Bombali</option>
                <option value="Bonthe">Bonthe</option>
                <option value="Falaba">Falaba</option>
                <option value="Kailahun">Kailahun</option>
                <option value="Kambia">Kambia</option>
                <option value="Karene">Karene</option>
                <option value="Kenema">Kenema</option>
                <option value="Koinadugu">Koinadugu</option>
                <option value="Kono">Kono</option>
                <option value="Moyamba">Moyamba</option>
                <option value="Port Loko">Port Loko</option>
                <option value="Pujehun">Pujehun</option>
                <option value="Tonkolili">Tonkolili</option>
                <option value="Western Area Rural">Western Area Rural</option>
                <option value="Western Area Urban">Western Area Urban</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-secondary-500 hover:bg-secondary-400 text-primary-950 px-8 py-4 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-0.5"
            >
              Search Jobs
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">

        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 flex items-center text-lg">
                <Filter className="h-4 w-4 mr-2 text-primary-600" /> Filters
              </h3>
              {hasActiveFilters && (
                <Link href="/jobs" className="text-xs font-semibold text-red-500 hover:text-red-700 flex items-center">
                  <X className="h-3 w-3 mr-1" /> Clear
                </Link>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4">Job Type</h4>
                <div className="space-y-3">
                  {['FULL_TIME', 'PART_TIME', 'CONTRACT', 'REMOTE'].map((type) => (
                    <label key={type} className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 mr-3 cursor-pointer"
                      />
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition capitalize font-medium">
                        {type.replace('_', ' ').toLowerCase()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4">Category</h4>
                <div className="space-y-2">
                  {categories.map((c) => (
                    <Link
                      key={c}
                      href={`/jobs?category=${encodeURIComponent(c)}`}
                      className={`block text-sm py-1.5 px-3 rounded-lg transition font-medium ${
                        category === c
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {c}
                    </Link>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-700 uppercase tracking-wider mb-4">Location</h4>
                <div className="space-y-2">
                  {['Bo', 'Bombali', 'Bonthe', 'Falaba', 'Kailahun', 'Kambia', 'Karene', 'Kenema', 'Koinadugu', 'Kono', 'Moyamba', 'Port Loko', 'Pujehun', 'Tonkolili', 'Western Area Rural', 'Western Area Urban'].map((loc) => (
                    <Link
                      key={loc}
                      href={`/jobs?location=${loc}`}
                      className={`block text-sm py-1.5 px-3 rounded-lg transition font-medium ${
                        location === loc
                          ? 'bg-primary-50 text-primary-700 border border-primary-200'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      {loc}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Job Listings ── */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-2xl font-extrabold text-slate-900">
              {jobs.length} <span className="text-slate-500 font-semibold text-xl">Jobs Found</span>
            </h2>
            <select className="border border-slate-200 rounded-xl py-2 px-4 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm">
              <option>Most Recent</option>
              <option>Most Relevant</option>
            </select>
          </div>

          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-white p-14 text-center rounded-2xl border border-slate-200 shadow-sm">
                <Briefcase className="h-14 w-14 mx-auto text-slate-200 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No jobs found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters or search terms.</p>
                <Link
                  href="/jobs"
                  className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
                >
                  Clear all filters
                </Link>
              </div>
            ) : (
              jobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 relative overflow-hidden">
                    {/* Accent bar on hover */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-gradient-to-b group-hover:from-primary-500 group-hover:to-secondary-500 transition-all duration-300 rounded-l-2xl"></div>

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="h-14 w-14 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-xl text-primary-600 shrink-0 shadow-sm">
                          {job.company.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary-700 transition mb-1">
                            {job.title}
                          </h3>
                          <p className="text-primary-600 font-semibold text-sm">{job.company.name}</p>
                        </div>
                      </div>
                      <span className="shrink-0 bg-primary-50 text-primary-700 text-xs font-bold px-4 py-1.5 rounded-full border border-primary-100">
                        {job.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center mt-5 text-sm text-slate-500 gap-y-2 gap-x-5 ml-0 sm:ml-18">
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-slate-400" /> {job.location}
                      </span>
                      {job.category && (
                        <span className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-1.5 text-slate-400" /> {job.category}
                        </span>
                      )}
                      {job.salaryMin && job.salaryMax && (
                        <span className="font-semibold text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-100">
                          Le {job.salaryMin.toLocaleString()} – {job.salaryMax.toLocaleString()}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 ml-0 sm:ml-18 text-slate-600 text-sm leading-relaxed line-clamp-2">
                      {job.description}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex justify-between items-center ml-0 sm:ml-18">
                      <span className="text-xs text-slate-400 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        {formatDistanceToNow(new Date(job.createdAt))} ago
                      </span>
                      <span className="text-sm font-bold text-primary-600 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-3 group-hover:translate-x-0">
                        View Details →
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
