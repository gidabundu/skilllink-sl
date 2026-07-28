'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building,
  BarChart3,
  Menu,
  X,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useState } from 'react'

const roleConfig = {
  ADMIN: {
    label: 'Admin',
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
    links: [
      { name: 'Dashboard',       href: '/dashboard/employer',              icon: LayoutDashboard },
      { name: 'My Jobs',         href: '/dashboard/employer/jobs',         icon: Briefcase },
      { name: 'Applications',    href: '/dashboard/employer/applications', icon: Users },
      { name: 'Company Profile', href: '/dashboard/employer/profile',      icon: Building },
    ],
  },
  SEEKER: {
    label: 'Job Seeker',
    links: [
      { name: 'My Applications', href: '/dashboard/seeker',          icon: LayoutDashboard },
      { name: 'Browse Jobs',     href: '/jobs',                       icon: Briefcase },
      { name: 'My Profile',      href: '/dashboard/seeker/profile',   icon: Users },
    ],
  },
}

export default function MobileDashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.SEEKER

  const visibleLinks = config.links.slice(0, 4)

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-2 safe-area-bottom">
        {visibleLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (
            link.href !== '/dashboard/admin' &&
            link.href !== '/dashboard/employer' &&
            link.href !== '/dashboard/seeker' &&
            pathname.startsWith(link.href)
          )
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-0 transition-colors ${
                isActive ? 'text-secondary-400' : 'text-slate-500'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-[10px] font-bold truncate">{link.name}</span>
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-red-500"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[10px] font-bold">Sign Out</span>
        </button>
      </nav>
    </>
  )
}
