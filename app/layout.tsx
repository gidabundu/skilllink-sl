import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { NextAuthProvider } from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "SkillLink SL – Sierra Leone's Premier Job Recruitment Platform",
  description: 'Connect with top employers and exceptional talent in Sierra Leone. Browse hundreds of jobs and hire the best candidates with SkillLink SL.',
  keywords: ['jobs Sierra Leone', 'recruitment', 'hiring', 'careers', 'Freetown jobs', 'SkillLink SL'],
  openGraph: {
    title: "SkillLink SL – Find Your Next Opportunity in Sierra Leone",
    description: 'The premier job recruitment platform connecting top talent with world-class organizations across Sierra Leone.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} min-h-screen flex flex-col bg-background text-slate-900 antialiased`}>
        <NextAuthProvider>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  )
}
