import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    // Strict admin-only guard
    if (!session || !session.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required.' }, { status: 403 })
    }

    const resolvedParams = await params
    const companyId = resolvedParams.id

    if (!companyId || typeof companyId !== 'string') {
      return NextResponse.json({ error: 'Invalid company ID.' }, { status: 400 })
    }

    const company = await prisma.company.findUnique({ where: { id: companyId }, include: { employer: true } })
    if (!company) {
      return NextResponse.json({ error: 'Company not found.' }, { status: 404 })
    }

    await prisma.company.update({
      where: { id: companyId },
      data: { verified: true },
    })

    // Notify the employer their company has been approved
    await prisma.notification.create({
      data: {
        userId: company.employerId,
        title: '🎉 Company Verified!',
        message: `Your company "${company.name}" has been verified by an admin. You can now post jobs on SkillLink SL!`,
        type: 'success',
        link: '/dashboard/employer/post',
      }
    })

    // Support both redirect (for form-based) and JSON (for AJAX)
    const acceptHeader = req.headers.get('accept') || ''
    if (acceptHeader.includes('application/json')) {
      return NextResponse.json({ message: `${company.name} has been verified successfully.` })
    }

    return NextResponse.redirect(new URL('/dashboard/admin/companies', req.url), 303)
  } catch (error) {
    console.error('Error verifying company:', error)
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 })
  }
}
