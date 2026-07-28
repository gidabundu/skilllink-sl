import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary-950 border-t border-primary-900 pt-16 pb-8 text-primary-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="relative w-12 h-12 overflow-hidden rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1">
                <Image src="/logo.png" alt="SkillLink SL Logo" width={40} height={40} className="object-contain" />
              </div>
              <span className="font-black text-2xl text-white tracking-tight">SkillLink SL</span>
            </Link>
            <p className="text-primary-300 leading-relaxed mb-6 max-w-md">
              Connecting Sierra Leone's top talent with great companies. Your next career move starts here, powered by a platform built for Africa's future.
            </p>
            <div className="flex space-x-4">
              {/* Removed Lucide social icons as per previous fix, keeping structural empty states for actual custom SVGs later or simple text */}
              <a href="#" className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center hover:bg-secondary-500 hover:text-primary-950 transition-colors">
                <span className="font-bold text-sm">IN</span>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center hover:bg-secondary-500 hover:text-primary-950 transition-colors">
                <span className="font-bold text-sm">FB</span>
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-primary-900 flex items-center justify-center hover:bg-secondary-500 hover:text-primary-950 transition-colors">
                <span className="font-bold text-sm">TW</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">Candidates</h3>
            <ul className="space-y-4">
              <li><Link href="/jobs" className="hover:text-secondary-400 transition-colors">Find a Job</Link></li>
              <li><Link href="/companies" className="hover:text-secondary-400 transition-colors">Browse Companies</Link></li>
              <li><Link href="/auth/register?role=seeker" className="hover:text-secondary-400 transition-colors flex items-center">Create Profile <ArrowUpRight className="h-3 w-3 ml-1 opacity-50" /></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">Employers</h3>
            <ul className="space-y-4">
              <li><Link href="/auth/register?role=employer" className="hover:text-secondary-400 transition-colors">Post a Job</Link></li>
              <li><Link href="/contact" className="hover:text-secondary-400 transition-colors">Enterprise Sales</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-bold tracking-wider mb-6">SkillLink</h3>
            <ul className="space-y-4">
              <li><Link href="/contact" className="hover:text-secondary-400 transition-colors">Contact Us</Link></li>
              <li><Link href="/privacy" className="hover:text-secondary-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-secondary-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-primary-900/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-500">
          <p>&copy; {new Date().getFullYear()} SkillLink SL. All rights reserved.</p>
          <p>Built with purpose in Sierra Leone.</p>
        </div>
      </div>
    </footer>
  )
}
