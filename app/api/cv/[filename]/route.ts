import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(req: Request, { params }: { params: Promise<{ filename: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { filename } = await params
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '') // Sanitize
    
    // Authorization check
    const userRole = (session.user as any).role
    const userId = (session.user as any).id
    
    // Seekers can only download their own CV
    if (userRole === 'SEEKER') {
      const profile = await prisma.seekerProfile.findUnique({ where: { userId } })
      if (!profile || !profile.cvPath || !profile.cvPath.endsWith(safeFilename)) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }
    
    // Employers can only download CVs of seekers who applied to their jobs
    if (userRole === 'EMPLOYER') {
      const company = await prisma.company.findUnique({ where: { employerId: userId } })
      if (!company) return new NextResponse('Forbidden', { status: 403 })
        
      const applicationExists = await prisma.application.findFirst({
        where: {
          job: { companyId: company.id },
          cvPath: { endsWith: safeFilename }
        }
      })
      if (!applicationExists) {
        return new NextResponse('Forbidden', { status: 403 })
      }
    }

    // Admins can download any CV
    // If not SEEKER, EMPLOYER, or ADMIN, deny
    if (userRole !== 'SEEKER' && userRole !== 'EMPLOYER' && userRole !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const filePath = join(process.cwd(), 'public', 'uploads', 'resumes', safeFilename)
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on extension
    let contentType = 'application/octet-stream'
    if (safeFilename.endsWith('.pdf')) contentType = 'application/pdf'
    if (safeFilename.endsWith('.doc')) contentType = 'application/msword'
    if (safeFilename.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('CV download error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
