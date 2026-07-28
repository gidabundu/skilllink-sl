import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const VALID_JOB_TYPES = new Set(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP', 'REMOTE'])

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // Verify company using correct field (employerId, not userId)
    const company = await prisma.company.findUnique({
      where: { employerId: userId }
    })

    if (!company) {
      return NextResponse.json({ error: 'Company profile not found.' }, { status: 404 })
    }

    if (!company.verified) {
      return NextResponse.json({ error: 'Your company must be verified by an admin before you can post jobs.' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, location, type, salary, categoryId } = body

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ error: 'Job title must be at least 3 characters.' }, { status: 400 })
    }
    if (!description || typeof description !== 'string' || description.trim().length < 50) {
      return NextResponse.json({ error: 'Job description must be at least 50 characters.' }, { status: 400 })
    }
    if (!location || typeof location !== 'string') {
      return NextResponse.json({ error: 'Location is required.' }, { status: 400 })
    }
    if (!type || !VALID_JOB_TYPES.has(type.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid employment type.' }, { status: 400 })
    }
    if (!categoryId || typeof categoryId !== 'string') {
      return NextResponse.json({ error: 'A job category is required.' }, { status: 400 })
    }

    // Verify category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json({ error: 'Invalid category selected.' }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title: title.trim().substring(0, 200),
        description: description.trim().substring(0, 20000),
        location: location.trim().substring(0, 200),
        type: type.toUpperCase(),
        salary: salary ? salary.trim().substring(0, 100) : null,
        category: category.name,
        companyId: company.id,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({ message: 'Job listed successfully!', job }, { status: 201 })
  } catch (error: any) {
    console.error('Job creation error:', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
