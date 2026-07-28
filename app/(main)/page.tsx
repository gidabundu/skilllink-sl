import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Search, MapPin, Briefcase, Building, ChevronRight, CheckCircle2, TrendingUp, Users, ArrowUpRight, Zap, Globe, ShieldCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Fetch real dynamic data
  const [activeJobsCount, companiesCount, candidatesCount, featuredJobs] = await Promise.all([
    prisma.job.count({ where: { status: 'ACTIVE' } }),
    prisma.company.count({ where: { verified: true } }),
    prisma.user.count({ where: { role: 'SEEKER' } }),
    prisma.job.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      orderBy: { views: 'desc' }, // Top viewed jobs as featured
      include: { company: true }
    })
  ])

  return (
    <div className="flex flex-col w-full overflow-hidden">
      {/* 
        ========================================
        HERO SECTION - Premium, African-Global
        ========================================
      */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-32 overflow-hidden bg-primary-950 text-white">
        {/* Animated Background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-primary-500/30 bg-primary-900/50 backdrop-blur-md mb-8 animate-fade-in-up">
              <span className="flex h-2 w-2 rounded-full bg-secondary-400 mr-2"></span>
              <span className="text-sm font-medium text-primary-200">The premier recruitment platform for Sierra Leone</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Discover Your Potential in <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500">Africa's Future</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-200 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              SkillLink SL bridges the gap between exceptional local talent and world-class organizations. Start your journey today.
            </p>
            
            {/* Search Box - Premium Glassmorphism */}
            <div className="glass-dark p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row max-w-4xl mx-auto space-y-2 md:space-y-0 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <form className="w-full flex flex-col md:flex-row" action="/jobs">
                <div className="flex-1 flex items-center px-4 py-3 md:border-r border-primary-700/50">
                  <Search className="h-5 w-5 text-primary-400 mr-3" />
                  <input 
                    type="text" 
                    name="search"
                    placeholder="Job title, skills, or company" 
                    className="w-full focus:outline-none text-white bg-transparent placeholder-primary-400 text-lg"
                  />
                </div>
                <div className="flex-1 flex items-center px-4 py-3">
                  <MapPin className="h-5 w-5 text-primary-400 mr-3" />
                  <select name="location" className="w-full focus:outline-none text-primary-100 bg-transparent cursor-pointer text-lg appearance-none">
                    <option value="" className="text-slate-900">Any Location</option>
                    <option value="Bo" className="text-slate-900">Bo</option>
                    <option value="Bombali" className="text-slate-900">Bombali</option>
                    <option value="Bonthe" className="text-slate-900">Bonthe</option>
                    <option value="Falaba" className="text-slate-900">Falaba</option>
                    <option value="Kailahun" className="text-slate-900">Kailahun</option>
                    <option value="Kambia" className="text-slate-900">Kambia</option>
                    <option value="Karene" className="text-slate-900">Karene</option>
                    <option value="Kenema" className="text-slate-900">Kenema</option>
                    <option value="Koinadugu" className="text-slate-900">Koinadugu</option>
                    <option value="Kono" className="text-slate-900">Kono</option>
                    <option value="Moyamba" className="text-slate-900">Moyamba</option>
                    <option value="Port Loko" className="text-slate-900">Port Loko</option>
                    <option value="Pujehun" className="text-slate-900">Pujehun</option>
                    <option value="Tonkolili" className="text-slate-900">Tonkolili</option>
                    <option value="Western Area Rural" className="text-slate-900">Western Area Rural</option>
                    <option value="Western Area Urban" className="text-slate-900">Western Area Urban</option>
                  </select>
                </div>
                <button type="submit" className="bg-secondary-500 hover:bg-secondary-400 text-primary-950 px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:-translate-y-1">
                  Find Jobs
                </button>
              </form>
            </div>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-primary-300 font-medium animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <span>Popular:</span>
              <Link href="/jobs?category=Engineering" className="hover:text-secondary-400 transition">Software Engineering</Link>
              <Link href="/jobs?category=Finance" className="hover:text-secondary-400 transition">Finance</Link>
              <Link href="/jobs?category=NGO" className="hover:text-secondary-400 transition">NGO & Development</Link>
            </div>
          </div>
        </div>
        
        {/* Slanted edge transition */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-16 md:h-24" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M1200 120L0 16.48 0 120 1200 120z" className="fill-background"></path>
          </svg>
        </div>
      </section>

      {/* 
        ========================================
        DYNAMIC STATS SECTION
        ========================================
      */}
      <section className="py-12 bg-background relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 grid grid-cols-1 md:grid-cols-3 gap-8 text-center transform -translate-y-10 border border-slate-100">
            <div className="flex flex-col items-center justify-center p-4">
              <div className="h-14 w-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                <Briefcase className="h-7 w-7" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{activeJobsCount.toLocaleString()}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Active Jobs</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l border-slate-200">
              <div className="h-14 w-14 bg-secondary-100 text-secondary-600 rounded-2xl flex items-center justify-center mb-4 transform -rotate-3">
                <Building className="h-7 w-7" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{companiesCount.toLocaleString()}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Verified Companies</div>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border-t md:border-t-0 md:border-l border-slate-200">
              <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 transform rotate-3">
                <Users className="h-7 w-7" />
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">{candidatesCount.toLocaleString()}</div>
              <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">Candidates</div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        NEW SECTION: HOW IT WORKS
        ========================================
      */}
      <section className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-3">Process</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">How SkillLink Works</h3>
            <p className="text-lg text-slate-600">
              Our platform simplifies the hiring and job-seeking process, creating perfect matches faster than ever before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center relative">
            {/* Connecting lines for desktop */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-primary-200 via-primary-500 to-primary-200 z-0"></div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-primary-100 shadow-xl flex items-center justify-center mb-8 shrink-0 relative">
                <div className="absolute inset-0 bg-primary-600 rounded-full opacity-10 animate-ping"></div>
                <Users className="h-10 w-10 text-primary-600" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-primary-950 font-black text-sm border-2 border-white">1</div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Create an Account</h4>
              <p className="text-slate-600 leading-relaxed">
                Register as a job seeker or employer in minutes. Set up your comprehensive profile and get verified to access exclusive features.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-primary-100 shadow-xl flex items-center justify-center mb-8 shrink-0 relative">
                <Search className="h-10 w-10 text-primary-600" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-primary-950 font-black text-sm border-2 border-white">2</div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Search & Connect</h4>
              <p className="text-slate-600 leading-relaxed">
                Job seekers can browse hundreds of tailored opportunities. Employers can easily post jobs and reach a massive pool of curated talent.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-primary-100 shadow-xl flex items-center justify-center mb-8 shrink-0 relative">
                <Zap className="h-10 w-10 text-primary-600" />
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center text-primary-950 font-black text-sm border-2 border-white">3</div>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Grow & Succeed</h4>
              <p className="text-slate-600 leading-relaxed">
                Review applications, schedule interviews instantly through our portal, and successfully close the gap between talent and opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        NEW SECTION: WHY CHOOSE US
        ========================================
      */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-3 text-center">The SkillLink Advantage</h2>
            <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 text-center">Designed for Excellence</h3>
            <p className="text-lg text-slate-600 mb-10 text-center">
              We go beyond basic job boards. We provide a comprehensive ecosystem designed specifically to elevate the recruitment standards in Sierra Leone to a world-class level.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-primary-700" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Verified Ecosystem</h4>
                <p className="text-slate-600">Every employer undergoes strict verification checks, eliminating spam and ensuring completely secure applications.</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-primary-700" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Global Standards</h4>
                <p className="text-slate-600">Built using cutting-edge technology, offering lightning-fast performance and an intuitive, beautiful interface.</p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-primary-700" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">Data-Driven Insights</h4>
                <p className="text-slate-600">Employers receive advanced analytics on job postings to continuously optimize their hiring pipelines.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 
        ========================================
        FEATURED JOBS (Dynamic)
        ========================================
      */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div className="max-w-2xl">
              <h2 className="text-sm font-bold tracking-widest text-primary-600 uppercase mb-3">Current Openings</h2>
              <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">Top Opportunities</h3>
              <p className="text-lg text-slate-600">Discover roles from companies actively looking for your unique skills.</p>
            </div>
            <Link href="/jobs" className="group inline-flex items-center justify-center px-6 py-3 border-2 border-primary-200 rounded-xl text-primary-700 font-bold hover:bg-primary-50 transition-all duration-300">
              Explore All Jobs 
              <ArrowUpRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <Link 
                key={job.id} 
                href={`/jobs/${job.id}`}
                className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col h-full"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-2xl text-primary-600 shadow-sm">
                    {job.company.name.charAt(0)}
                  </div>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-primary-50 text-primary-700 border border-primary-100">
                    {job.type.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="flex-grow">
                  <h4 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{job.title}</h4>
                  <div className="text-slate-600 font-medium mb-6 flex items-center">
                    {job.company.name}
                    {job.company.verified && <CheckCircle2 className="h-4 w-4 ml-1 text-emerald-500 inline" />}
                  </div>
                </div>
                
                <div className="mt-auto border-t border-slate-100 pt-6 flex flex-wrap items-center gap-y-2 text-sm text-slate-500 justify-between">
                  <span className="flex items-center font-medium"><MapPin className="h-4 w-4 mr-1 text-slate-400" /> {job.location}</span>
                  <span className="flex items-center font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-lg">
                    Apply Now <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}

            {featuredJobs.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500">
                No active jobs currently available. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 
        ========================================
        SPLIT CTA SECTION
        ========================================
      */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-950 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 relative z-10">
              {/* Employer CTA */}
              <div className="p-10 md:p-16 border-b lg:border-b-0 lg:border-r border-primary-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-700">
                  <Building className="w-64 h-64 text-white" />
                </div>
                <h3 className="text-sm font-bold tracking-widest text-secondary-400 uppercase mb-3">For Employers</h3>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Build Your Dream Team</h2>
                <p className="text-primary-200 text-lg mb-8 max-w-md">
                  Post jobs, review applications, and hire the best talent in Sierra Leone with our powerful employer tools.
                </p>
                <Link 
                  href="/auth/register?role=employer" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-secondary-500 text-primary-950 font-bold rounded-xl hover:bg-secondary-400 transition-colors shadow-lg"
                >
                  Post a Job Today <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
              
              {/* Seeker CTA */}
              <div className="p-10 md:p-16 relative overflow-hidden group bg-primary-900/50">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-700">
                  <TrendingUp className="w-64 h-64 text-white" />
                </div>
                <h3 className="text-sm font-bold tracking-widest text-secondary-400 uppercase mb-3">For Job Seekers</h3>
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">Elevate Your Career</h2>
                <p className="text-primary-200 text-lg mb-8 max-w-md">
                  Create a profile, apply to top roles instantly, and get noticed by leading organizations.
                </p>
                <Link 
                  href="/auth/register?role=seeker" 
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-primary-300 text-white font-bold rounded-xl hover:bg-primary-800 transition-colors"
                >
                  Create Free Profile <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
