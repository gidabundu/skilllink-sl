'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  
  // Is this the home page? If so, make navbar transparent initially
  const isHome = pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const userRole = (session?.user as any)?.role

  const getDashboardLink = () => {
    if (userRole === 'ADMIN') return '/dashboard/admin'
    if (userRole === 'EMPLOYER') return '/dashboard/employer'
    return '/dashboard/seeker'
  }

  const isActive = (path: string) => pathname === path

  const navClass = `fixed w-full top-0 z-50 transition-all duration-300 ${
    isHome && !scrolled && !isOpen
      ? 'bg-transparent border-transparent py-4'
      : 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm py-2'
  }`

  const textColorClass = isHome && !scrolled && !isOpen ? 'text-white' : 'text-slate-900'
  const linkColorClass = isHome && !scrolled && !isOpen ? 'text-primary-100 hover:text-white' : 'text-slate-600 hover:text-primary-600'
  const activeLinkClass = isHome && !scrolled && !isOpen ? 'text-secondary-400 font-semibold' : 'text-primary-600 font-semibold'

  return (
    <nav className={navClass}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1">
                <Image src="/logo.png" alt="SkillLink SL Logo" width={32} height={32} className="object-contain" />
              </div>
              <span className={`font-black text-xl tracking-tight transition-colors ${textColorClass}`}>SkillLink SL</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className={`text-sm font-medium transition-colors ${isActive('/') ? activeLinkClass : linkColorClass}`}>
                Home
              </Link>
              <Link href="/jobs" className={`text-sm font-medium transition-colors ${isActive('/jobs') ? activeLinkClass : linkColorClass}`}>
                Find Jobs
              </Link>
              <Link href="/companies" className={`text-sm font-medium transition-colors ${isActive('/companies') ? activeLinkClass : linkColorClass}`}>
                Companies
              </Link>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {session ? (
              <>
                <button className={`p-1 rounded-full focus:outline-none transition-colors ${linkColorClass}`}>
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-5 w-5" />
                </button>
                
                <Link href={getDashboardLink()} className={`text-sm font-medium transition-colors ${linkColorClass}`}>
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="text-sm font-medium text-red-500 hover:text-red-600 transition">
                  Logout
                </button>
                
                {userRole === 'EMPLOYER' && (
                  <Link href="/dashboard/employer/post" className="ml-2 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold text-primary-950 bg-secondary-500 hover:bg-secondary-400 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                    Post a Job
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/auth/login" className={`text-sm font-medium transition-colors ${linkColorClass}`}>
                  Log in
                </Link>
                <Link href="/auth/register" className={`inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${isHome && !scrolled && !isOpen ? 'bg-white text-primary-900 hover:bg-slate-50' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                  Sign up
                </Link>
              </>
            )}
          </div>
          
          <div className="-mr-2 flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`inline-flex items-center justify-center p-2 rounded-md focus:outline-none transition-colors ${textColorClass}`}>
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X className="block h-6 w-6 text-slate-900" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white shadow-xl border-t border-slate-100 absolute w-full left-0 top-full pb-4">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className={`block pl-4 pr-4 py-3 text-base font-medium ${isActive('/') ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              Home
            </Link>
            <Link href="/jobs" className={`block pl-4 pr-4 py-3 text-base font-medium ${isActive('/jobs') ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              Find Jobs
            </Link>
            <Link href="/companies" className={`block pl-4 pr-4 py-3 text-base font-medium ${isActive('/companies') ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              Companies
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-slate-200">
            {session ? (
              <div className="space-y-1">
                <Link href={getDashboardLink()} className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                  Dashboard
                </Link>
                <button onClick={() => signOut()} className="block w-full text-left px-4 py-3 text-base font-medium text-red-500 hover:bg-red-50">
                  Sign out
                </button>
              </div>
            ) : (
              <div className="space-y-1 p-4 flex flex-col gap-3">
                <Link href="/auth/login" className="block w-full text-center px-4 py-3 border border-slate-300 rounded-xl text-base font-bold text-slate-700 hover:bg-slate-50">
                  Log in
                </Link>
                <Link href="/auth/register" className="block w-full text-center px-4 py-3 rounded-xl text-base font-bold bg-primary-600 text-white hover:bg-primary-700">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
