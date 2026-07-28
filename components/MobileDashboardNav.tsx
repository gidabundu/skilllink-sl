'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building,
  BarChart3,
  X,
  LogOut,
  Menu,
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
      { name: 'Dashboard',    href: '/dashboard/employer',              icon: LayoutDashboard },
      { name: 'My Jobs',      href: '/dashboard/employer/jobs',         icon: Briefcase },
      { name: 'Applications', href: '/dashboard/employer/applications', icon: Users },
      { name: 'Profile',      href: '/dashboard/employer/profile',      icon: Building },
    ],
  },
  SEEKER: {
    label: 'Job Seeker',
    links: [
      { name: 'Applications', href: '/dashboard/seeker',         icon: LayoutDashboard },
      { name: 'Browse Jobs',  href: '/jobs',                     icon: Briefcase },
      { name: 'My Profile',   href: '/dashboard/seeker/profile', icon: Users },
    ],
  },
}

export default function MobileDashboardNav({ role }: { role: string }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.SEEKER

  // Show first 4 in bottom bar, rest in drawer
  const bottomLinks = config.links.slice(0, 4)
  const drawerLinks = config.links.slice(4)

  const isActive = (href: string) =>
    pathname === href || (
      href !== '/dashboard/admin' &&
      href !== '/dashboard/employer' &&
      href !== '/dashboard/seeker' &&
      pathname.startsWith(href)
    )

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 safe-area-bottom">
        <div className="flex items-stretch justify-around px-1 py-1">
          {bottomLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl flex-1 transition-colors ${
                  active ? 'text-secondary-400 bg-white/5' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-[9px] font-bold truncate max-w-full">{link.name}</span>
              </Link>
            )
          })}

          {/* More button — shows overflow links or just a menu for sign out */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl flex-1 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <Menu className="w-5 h-5 shrink-0" />
            <span className="text-[9px] font-bold">More</span>
          </button>
        </div>
      </nav>

      {/* Slide-up Drawer */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative bg-white rounded-t-3xl shadow-2xl p-6 pb-10 z-10">
            <div className="flex items-center justify-between mb-6">
              <span className="font-black text-slate-900 text-lg">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            <div className="space-y-2">
              {/* Overflow links (e.g. admin Analytics) */}
              {drawerLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors ${
                      active
                        ? 'bg-secondary-50 text-secondary-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {link.name}
                  </Link>
                )
              })}

              {/* All links repeated for easy access */}
              {bottomLinks.map((link) => {
                const Icon = link.icon
                const active = isActive(link.href)
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-colors ${
                      active
                        ? 'bg-secondary-50 text-secondary-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {link.name}
                  </Link>
                )
              })}

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-red-600 hover:bg-red-50 transition-colors mt-2"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
