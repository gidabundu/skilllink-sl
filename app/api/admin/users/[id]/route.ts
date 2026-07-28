import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { sendEmployerVerificationEmail } from '@/lib/notifications'

function isAdmin(session: any) {
  return session?.user && (session.user as any).role === 'ADMIN'
}

// PUT /api/admin/users/[id]/verify - Verify or reject employer
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { approved } = await req.json()

    const user = await prisma.user.update({
      where: { id },
      data: { verified: approved },
    })

    if (user.role === 'EMPLOYER') {
      await prisma.company.update({
        where: { employerId: id },
        data: { verified: approved },
      })
    }

    // Notify user
    await prisma.notification.create({
      data: {
        userId: id,
        title: approved ? 'Account Verified!' : 'Verification Update',
        message: approved
          ? 'Your employer account has been verified. You can now post jobs!'
          : 'Your employer account verification requires more review. Please contact support.',
        type: approved ? 'success' : 'warning',
      },
    })

    await sendEmployerVerificationEmail(user.name, user.email, approved)

    return NextResponse.json({ message: `User ${approved ? 'verified' : 'unverified'} successfully`, user })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    if (!isAdmin(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
