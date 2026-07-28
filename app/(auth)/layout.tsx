import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Auth layout: no Navbar, no Footer — completely clean screen, but with a Back Home button
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen relative">
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-slate-200 transition-all hover:shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
      {children}
    </main>
  )
}
