import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Clean existing data
  await prisma.notification.deleteMany()
  await prisma.application.deleteMany()
  await prisma.job.deleteMany()
  await prisma.company.deleteMany()
  await prisma.seekerProfile.deleteMany()
  await prisma.user.deleteMany()

  const adminPasswordHash = await bcrypt.hash('Admin@123', 12)
  const employerPasswordHash = await bcrypt.hash('Employer@123', 12)
  const seekerPasswordHash = await bcrypt.hash('Seeker@123', 12)

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@skilllink.sl',
      password: adminPasswordHash,
      role: 'ADMIN',
      verified: true,
    },
  })
  console.log(`Created admin: ${admin.email}`)

  // 2. Create Employer
  const employer1 = await prisma.user.create({
    data: {
      name: 'Freetown Tech',
      email: 'hr@freetowntech.sl',
      password: employerPasswordHash,
      role: 'EMPLOYER',
      verified: true,
      company: {
        create: {
          name: 'Freetown Tech Solutions',
          description: 'Leading tech company in Sierra Leone.',
          industry: 'Technology',
          size: '50-100',
          location: 'Freetown',
          verified: true,
        },
      },
    },
    include: { company: true },
  })
  console.log(`Created employer: ${employer1.email}`)

  // 3. Create Job Seeker
  const seeker1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: seekerPasswordHash,
      role: 'SEEKER',
      verified: true,
      seekerProfile: {
        create: {
          bio: 'Experienced software developer looking for new opportunities.',
          location: 'Bo',
          skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
          experience: '3 years at TechCorp',
        },
      },
    },
  })
  console.log(`Created seeker: ${seeker1.email}`)

  // 4. Create Jobs
  const job1 = await prisma.job.create({
    data: {
      companyId: employer1.company!.id,
      title: 'Senior Frontend Developer',
      description: 'We are looking for an experienced React developer.',
      requirements: '3+ years React, Next.js, Tailwind',
      category: 'Engineering',
      location: 'Freetown (Hybrid)',
      salaryMin: 5000,
      salaryMax: 8000,
      type: 'FULL_TIME',
      status: 'ACTIVE',
    },
  })
  console.log(`Created job: ${job1.title}`)

  // 5. Create Application
  const application1 = await prisma.application.create({
    data: {
      jobId: job1.id,
      seekerId: seeker1.id,
      status: 'PENDING',
      coverLetter: 'I am very interested in this role.',
    },
  })
  console.log(`Created application for ${seeker1.name} to ${job1.title}`)

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
