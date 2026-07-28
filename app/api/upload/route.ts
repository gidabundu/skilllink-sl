import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { prisma } from '@/lib/prisma'

// Strictly allowed MIME types and extensions for resumes
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.doc', '.docx'])
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file was uploaded.' }, { status: 400 })
    }

    // Security: Check file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File exceeds the maximum size of 5MB.' }, { status: 400 })
    }

    // Security: Check MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json({ error: 'Only PDF, DOC, and DOCX files are accepted.' }, { status: 400 })
    }

    // Security: Check extension
    const ext = extname(file.name).toLowerCase()
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: 'Only .pdf, .doc, and .docx extensions are accepted.' }, { status: 400 })
    }

    // Security: Sanitize filename - remove any path traversal characters
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').substring(0, 100)
    const uniqueFilename = `${Date.now()}-${(session.user as any).id.substring(0, 8)}-${safeName}`

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes')
    await mkdir(uploadDir, { recursive: true })

    const filePath = join(uploadDir, uniqueFilename)
    await writeFile(filePath, buffer)

    const cvPath = `/uploads/resumes/${uniqueFilename}`

    // Save to user's seeker profile
    await prisma.seekerProfile.update({
      where: { userId: (session.user as any).id },
      data: {
        cvPath: cvPath,
        cvName: safeName
      }
    })

    return NextResponse.json({
      message: 'Resume uploaded successfully.',
      cvPath,
      cvName: safeName
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file. Please try again.' }, { status: 500 })
  }
}
