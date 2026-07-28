import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/notifications'

// Simple in-memory rate limiter: max 10 register attempts per IP per 15 minutes
const registerAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = registerAttempts.get(ip)
  if (!record || now > record.resetAt) {
    registerAttempts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }
  if (record.count >= RATE_LIMIT) return false
  record.count++
  return true
}

// Allowed roles
const VALID_ROLES = new Set(['SEEKER', 'EMPLOYER'])

// Email validation regex
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many registration attempts. Please wait 15 minutes.' }, { status: 429 })
    }

    const body = await req.json()
    const { name, email, password, role, phone, companyName, companyDescription } = body

    // Input validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json({ error: 'Full name must be between 2 and 100 characters.' }, { status: 400 })
    }
    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }
    
    // Check password strength
    if (!password || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
       return NextResponse.json({ error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number.' }, { status: 400 })
    }

    if (!role || !VALID_ROLES.has(role.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid account role selected.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim().substring(0, 100),
        email: normalizedEmail,
        password: hashedPassword,
        role: role.toUpperCase(),
        phone: phone ? phone.trim().substring(0, 20) : null,
        verified: role.toUpperCase() === 'SEEKER',
      },
    })

    // Create profile based on role
    if (role.toUpperCase() === 'SEEKER') {
      await prisma.seekerProfile.create({
        data: { userId: user.id },
      })
    } else if (role.toUpperCase() === 'EMPLOYER') {
      await prisma.company.create({
        data: {
          employerId: user.id,
          name: companyName ? companyName.trim().substring(0, 100) : `${name.trim()}'s Company`,
          description: companyDescription ? companyDescription.trim().substring(0, 2000) : '',
        },
      })
    }

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Welcome to SkillLink SL! 🎉',
        message: `Hi ${user.name}, your account has been created. ${role.toUpperCase() === 'EMPLOYER' ? 'An admin will verify your company soon. Once verified, you can start posting jobs!' : 'Start browsing and applying for jobs now!'}`,
        type: 'success',
      },
    })

    await sendWelcomeEmail(user.name, user.email, role)

    return NextResponse.json({
      message: 'Account created successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error. Please try again.' }, { status: 500 })
  }
}
