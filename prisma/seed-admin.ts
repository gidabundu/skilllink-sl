import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting admin seed...')

  const password = 'Admin@12345'
  const hashedPassword = await bcrypt.hash(password, 12)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@skilllink.sl' },
    update: { 
      role: 'ADMIN', 
      verified: true,
      password: hashedPassword
    },
    create: {
      name: 'System Admin',
      email: 'admin@skilllink.sl',
      password: hashedPassword,
      role: 'ADMIN',
      verified: true,
    }
  })

  console.log('Admin account ready:')
  console.log('Email:   ', adminUser.email)
  console.log('Password: Admin@12345')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
