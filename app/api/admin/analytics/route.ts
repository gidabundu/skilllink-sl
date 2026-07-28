import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmployerVerificationEmail } from '@/lib/notifications'

function isAdmin(session: any) {
  return session?.user && (session.user as any).role === 'ADMIN'
}

// GET /api/admin/analytics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const [
      totalUsers,
      totalSeekers,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingVerifications,
      hiredCount,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'SEEKER' } }),
      prisma.user.count({ where: { role: 'EMPLOYER' } }),
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.application.count(),
      prisma.company.count({ where: { verified: false } }),
      prisma.application.count({ where: { status: 'HIRED' } }),
      prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { company: { select: { name: true } }, _count: { select: { applications: true } } },
      }),
      prisma.application.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          seeker: { select: { name: true } },
          job: { include: { company: { select: { name: true } } } },
        },
      }),
    ])

    return NextResponse.json({
      stats: { totalUsers, totalSeekers, totalEmployers, totalJobs, activeJobs, totalApplications, pendingVerifications, hiredCount },
      recentJobs,
      recentApplications,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
