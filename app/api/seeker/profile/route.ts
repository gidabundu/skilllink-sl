import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { seekerProfile: true }
    })

    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      linkedIn: user.seekerProfile?.linkedIn,
      portfolio: user.seekerProfile?.portfolio,
      cvPath: user.seekerProfile?.cvPath,
      cvName: user.seekerProfile?.cvName,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const { bio, location, experience, education, linkedIn, portfolio, skills } = await req.json()

    // Validate skills array
    if (skills !== undefined && !Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills must be an array.' }, { status: 400 })
    }
    const sanitizedSkills = Array.isArray(skills)
      ? skills.filter((s: any) => typeof s === 'string').slice(0, 20).map((s: string) => s.trim().substring(0, 50))
      : []

    const updated = await prisma.seekerProfile.update({
      where: { userId },
      data: {
        bio: bio?.trim().substring(0, 2000) || null,
        location: location?.trim() || null,
        experience: experience?.trim().substring(0, 5000) || null,
        education: education?.trim().substring(0, 2000) || null,
        linkedIn: linkedIn?.trim().substring(0, 500) || null,
        portfolio: portfolio?.trim().substring(0, 500) || null,
        skills: JSON.stringify(sanitizedSkills),
      },
    })

    return NextResponse.json({ message: 'Profile updated successfully', profile: updated })
  } catch (error: any) {
    console.error('Update seeker profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
