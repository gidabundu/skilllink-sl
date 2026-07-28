import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { name, description, industry, size, location, website } = await req.json()

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 })
    }

    const updated = await prisma.company.update({
      where: { employerId: userId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        industry: industry?.trim() || null,
        size: size?.trim() || null,
        location: location?.trim() || null,
        website: website?.trim() || null,
      },
    })

    return NextResponse.json({ message: 'Profile updated successfully', company: updated })
  } catch (error: any) {
    console.error('Update company profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
