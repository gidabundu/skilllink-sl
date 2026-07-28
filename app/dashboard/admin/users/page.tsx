import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Users, Search, ShieldCheck, UserCheck, UserX } from 'lucide-react'
import { format } from 'date-fns'

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') redirect('/auth/login')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { applications: true } } },
  })

  const seekers   = users.filter(u => u.role === 'SEEKER')
  const employers = users.filter(u => u.role === 'EMPLOYER')
  const admins    = users.filter(u => u.role === 'ADMIN')

  const roleBadge: Record<string, string> = {
    ADMIN:    'bg-red-100 text-red-800',
    EMPLOYER: 'bg-purple-100 text-purple-800',
    SEEKER:   'bg-primary-100 text-primary-800',
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-9 w-9 bg-secondary-500 rounded-xl flex items-center justify-center shadow-md shadow-secondary-500/20">
              <Users className="h-5 w-5 text-white" />
            </div>
            User Management
          </h1>
          <p className="text-slate-500 text-sm mt-1 ml-12">All registered users on the platform.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Users',  value: users.length,    color: 'bg-secondary-50 border-secondary-200 text-secondary-800 shadow-sm' },
          { label: 'Job Seekers',  value: seekers.length,  color: 'bg-blue-50 border-blue-100 text-blue-700 shadow-sm' },
          { label: 'Employers',    value: employers.length, color: 'bg-purple-50 border-purple-100 text-purple-700 shadow-sm' },
        ].map((c) => (
          <div key={c.label} className={`rounded-2xl border p-5 ${c.color}`}>
            <div className="text-3xl font-black">{c.value}</div>
            <div className="text-sm font-bold mt-1 opacity-80">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-extrabold text-slate-900">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Applications</th>
                <th className="text-left px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center font-black text-sm shrink-0 border border-secondary-200">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-xs text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${roleBadge[user.role] || 'bg-slate-100 text-slate-600'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {user.verified ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-bold">
                        <UserCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold">
                        <UserX className="h-3.5 w-3.5" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-700">{user._count.applications}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
