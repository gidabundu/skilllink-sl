'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  LogOut,
  Building,
  BarChart3,
  Globe,
  ChevronRight
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import Image from 'next/image'

const roleConfig = {
  ADMIN: {
    label: 'Admin',
    color: 'text-red-600 bg-red-100',
    links: [
      { name: 'Overview',   href: '/dashboard/admin',           icon: LayoutDashboard },
      { name: 'Users',      href: '/dashboard/admin/users',     icon: Users },
      { name: 'Jobs',       href: '/dashboard/admin/jobs',      icon: Briefcase },
      { name: 'Companies',  href: '/dashboard/admin/companies', icon: Building },
      { name: 'Analytics',  href: '/dashboard/admin/analytics', icon: BarChart3 },
    ],
  },
  EMPLOYER: {
    label: 'Employer',
    color: 'text-primary-700 bg-primary-100',
    links: [
      { name: 'Dashboard',       href: '/dashboard/employer',              icon: LayoutDashboard },
      { name: 'My Jobs',         href: '/dashboard/employer/jobs',         icon: Briefcase },
      { name: 'Applications',    href: '/dashboard/employer/applications', icon: Users },
      { name: 'Company Profile', href: '/dashboard/employer/profile',      icon: Building },
    ],
  },
  SEEKER: {
    label: 'Job Seeker',
    color: 'text-secondary-700 bg-secondary-100',
    links: [
      { name: 'My Applications', href: '/dashboard/seeker',          icon: LayoutDashboard },
      { name: 'Browse Jobs',     href: '/jobs',                       icon: Briefcase },
      { name: 'My Profile',      href: '/dashboard/seeker/profile',   icon: Users },
    ],
  },
}

export default function DashboardSidebar({ role, userName }: { role: string, userName: string }) {
  const pathname = usePathname()
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.SEEKER

  return (
    <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 min-h-full flex flex-col text-slate-300">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-slate-800 rounded-xl shadow-sm border border-slate-700 flex items-center justify-center p-1 shrink-0">
            <Image src="/logo.png" alt="SkillLink" width={28} height={28} className="object-contain brightness-200" />
          </div>
          <span className="font-black text-white text-base tracking-tight">SkillLink SL</span>
        </Link>
      </div>

      {/* User Badge */}
      <div className="px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-secondary-500/20 flex items-center justify-center font-black text-secondary-400 text-sm shrink-0 border border-secondary-500/30">
            {userName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-sm truncate">{userName}</div>
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${config.color.replace('bg-', 'bg-opacity-20 bg-')}`}>{config.label}</span>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {config.links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (link.href !== '/dashboard/admin' && link.href !== '/dashboard/employer' && link.href !== '/dashboard/seeker' && pathname.startsWith(link.href))
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-3 py-3 rounded-xl transition-all duration-150 group text-sm ${
                isActive
                  ? 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white font-bold shadow-lg shadow-secondary-500/20 border border-secondary-500/50'
                  : 'text-slate-400 font-semibold hover:bg-slate-800 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-secondary-400 transition-colors'}`} />
              {link.name}
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-0.5">
        <Link
          href="/"
          className="flex items-center px-3 py-3 rounded-xl text-sm text-slate-400 font-semibold hover:bg-slate-800 hover:text-white transition-all group border border-transparent"
        >
          <Globe className="w-4 h-4 mr-3 text-slate-500 group-hover:text-secondary-400 shrink-0 transition-colors" />
          View Website
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center px-3 py-3 rounded-xl text-sm text-red-400 font-semibold hover:bg-red-500/10 hover:border-red-500/20 transition-all group border border-transparent"
        >
          <LogOut className="w-4 h-4 mr-3 text-red-500/70 group-hover:text-red-400 shrink-0 transition-colors" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
