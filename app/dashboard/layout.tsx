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
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Mobile top dashboard nav */}
      <div className="lg:hidden">
        <MobileDashboardNav role={role} userName={userName} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block sticky top-0 h-screen overflow-y-auto flex-shrink-0">
        <DashboardSidebar role={role} userName={userName} />
      </div>

      <main className="flex-1 min-w-0 overflow-y-auto mt-14 lg:mt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
