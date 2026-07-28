import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendStatusUpdateEmail } from '@/lib/notifications'

// PUT /api/applications/[id] - Update application status (employer)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = session.user as any
    const body = await req.json()
    const { status, notes, interviewAt } = body

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: { include: { company: true } },
        seeker: true,
      },
    })

    if (!application) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

    // Only employer who owns the job, or admin, can update
    if (user.role !== 'ADMIN' && application.job.company.employerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status || application.status,
        notes: notes !== undefined ? notes : application.notes,
        interviewAt: interviewAt ? new Date(interviewAt) : application.interviewAt,
      },
    })

    // Notify seeker of status change
    if (status && status !== application.status) {
      await prisma.notification.create({
        data: {
          userId: application.seekerId,
          title: `Application ${status.charAt(0) + status.slice(1).toLowerCase()}`,
          message: `Your application for "${application.job.title}" at ${application.job.company.name} has been updated to: ${status}.`,
          type: status === 'HIRED' ? 'success' : status === 'REJECTED' ? 'warning' : 'info',
          link: '/dashboard/seeker',
        },
      })

      await sendStatusUpdateEmail(
        application.seeker.name,
        application.seeker.email,
        application.job.title,
        status
      )
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
