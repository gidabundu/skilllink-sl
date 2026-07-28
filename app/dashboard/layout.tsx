import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'
import MobileDashboardNav from '@/components/MobileDashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) redirect('/auth/login')

  const user = session.user as any
  const role = user.role || 'SEEKER'
  const userName = user.name || 'User'

  return (
    <div className="min-h-screen bg-slate-50 pt-20 flex">
      <div className="hidden lg:block sticky top-20 h-[calc(100vh-80px)] overflow-y-auto flex-shrink-0">
        <DashboardSidebar role={role} userName={userName} />
      </div>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
          {children}
        </div>
      </main>
      <MobileDashboardNav role={role} />
    </div>
  )
}
