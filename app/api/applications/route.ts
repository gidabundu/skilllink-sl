import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== 'SEEKER') {
      return NextResponse.json({ message: 'Only job seekers can apply for jobs.' }, { status: 403 })
    }

    const body = await req.json()
    const { jobId, firstName, lastName, phone, linkedIn, portfolio, coverLetter, cvPath, cvName } = body

    // Input validation
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json({ message: 'Job ID is required.' }, { status: 400 })
    }
    if (!coverLetter || coverLetter.trim().length < 100) {
      return NextResponse.json({ message: 'A cover letter of at least 100 characters is required.' }, { status: 400 })
    }
    if (!cvPath || typeof cvPath !== 'string') {
      return NextResponse.json({ message: 'A CV/Resume is required.' }, { status: 400 })
    }
    if (!firstName || !lastName) {
      return NextResponse.json({ message: 'First and last name are required.' }, { status: 400 })
    }

    // Sanitize: limit cover letter to reasonable length
    const sanitizedCoverLetter = coverLetter.trim().substring(0, 10000)

    // Check if job exists and is active
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true }
    })
    if (!job || job.status !== 'ACTIVE') {
      return NextResponse.json({ message: 'This job is no longer accepting applications.' }, { status: 404 })
    }

    // Check if company is verified
    if (!job.company.verified) {
      return NextResponse.json({ message: 'This company is not verified and cannot accept applications.' }, { status: 403 })
    }

    // Check for duplicate application
    const existing = await prisma.application.findUnique({
      where: {
        jobId_seekerId: {
          jobId,
          seekerId: user.id
        }
      }
    })
    if (existing) {
      return NextResponse.json({ message: 'You have already applied for this job.' }, { status: 409 })
    }

    // Update the seeker's profile with latest info if they submitted a CV
    if (cvPath && cvName) {
      await prisma.seekerProfile.updateMany({
        where: { userId: user.id },
        data: { cvPath, cvName }
      })
    }

    // Update phone on user if provided
    if (phone) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phone: phone.trim().substring(0, 20) }
      })
    }

    // Create Application
    const application = await prisma.application.create({
      data: {
        jobId,
        seekerId: user.id,
        status: 'PENDING',
        coverLetter: sanitizedCoverLetter,
        cvPath: cvPath || null,
        cvName: cvName || null,
        notes: JSON.stringify({
          firstName: firstName?.trim().substring(0, 50),
          lastName: lastName?.trim().substring(0, 50),
          phone: phone?.trim().substring(0, 20),
          linkedIn: linkedIn?.trim().substring(0, 200),
          portfolio: portfolio?.trim().substring(0, 200),
        }),
      },
    })

    // Create notification for the seeker
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Application Submitted!',
        message: `Your application for "${job.title}" at ${job.company.name} has been received. Good luck!`,
        type: 'success',
        link: `/dashboard/seeker`,
      }
    })

    return NextResponse.json({ message: 'Application submitted successfully!', application }, { status: 201 })
  } catch (error: any) {
    console.error('Apply error:', error)
    return NextResponse.json({ message: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
