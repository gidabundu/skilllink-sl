import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const applicationId = resolvedParams.id
    const { status } = await req.json()

    if (!['PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Verify the application belongs to a job owned by this employer
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { company: true }
        }
      }
    })

    if (!application || application.job.company.employerId !== (session.user as any).id) {
      return NextResponse.json({ error: 'Application not found or unauthorized' }, { status: 404 })
    }

    const updatedApp = await prisma.application.update({
      where: { id: applicationId },
      data: { status },
    })

    return NextResponse.json({ message: 'Status updated', application: updatedApp })
  } catch (error: any) {
    console.error('Update application status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
