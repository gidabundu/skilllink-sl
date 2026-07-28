import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting job seed...')

  // Create or get Users/Employers first
  const user1 = await prisma.user.upsert({
    where: { email: 'hr@techsalone.sl' },
    update: {},
    create: {
      name: 'HR TechSalone',
      email: 'hr@techsalone.sl',
      password: 'hashed_password_placeholder',
      role: 'EMPLOYER',
      verified: true,
      company: {
        create: {
          name: 'TechSalone Innovations',
          description: 'TechSalone Innovations is a leading software development agency based in Freetown. We build high-impact web and mobile applications for the West African market.',
          verified: true,
        }
      }
    },
    include: { company: true }
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'careers@agriplus.sl' },
    update: {},
    create: {
      name: 'AgriPlus HR',
      email: 'careers@agriplus.sl',
      password: 'hashed_password_placeholder',
      role: 'EMPLOYER',
      verified: true,
      company: {
        create: {
          name: 'AgriPlus Sierra Leone',
          description: 'AgriPlus is revolutionizing the agricultural supply chain. We work with local farmers to export premium organic produce to global markets.',
          verified: true,
        }
      }
    },
    include: { company: true }
  })

  const user3 = await prisma.user.upsert({
    where: { email: 'recruitment@freetownbank.sl' },
    update: {},
    create: {
      name: 'Freetown Trust HR',
      email: 'recruitment@freetownbank.sl',
      password: 'hashed_password_placeholder',
      role: 'EMPLOYER',
      verified: true,
      company: {
        create: {
          name: 'Freetown Trust Bank',
          description: 'One of the fastest-growing financial institutions in the country, providing modern banking solutions and corporate financing.',
          verified: true,
        }
      }
    },
    include: { company: true }
  })

  const company1 = user1.company!
  const company2 = user2.company!
  const company3 = user3.company!

  // Add jobs
  await prisma.job.create({
    data: {
      title: 'Senior Frontend Engineer (React/Next.js)',
      description: 'We are looking for an experienced Frontend Engineer to lead the development of our core SaaS platform. You will be responsible for architecture, performance optimization, and mentoring junior developers.\n\nYou should have a deep understanding of React, Next.js, and modern CSS frameworks like Tailwind.',
      requirements: '- 4+ years of professional experience with React and TypeScript\n- Proven experience building scalable Next.js applications\n- Strong eye for design and UI/UX best practices\n- Excellent problem-solving and communication skills',
      benefits: '- Competitive salary in USD\n- Full remote work options\n- Health insurance coverage\n- Annual learning and development budget',
      category: 'Technology',
      location: 'Freetown (Hybrid)',
      type: 'FULL_TIME',
      salaryMin: 25000,
      salaryMax: 40000,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'ACTIVE',
      companyId: company1.id,
    }
  })

  await prisma.job.create({
    data: {
      title: 'Supply Chain Operations Manager',
      description: 'AgriPlus is seeking a highly organized Operations Manager to oversee our logistics and supply chain operations in the Kenema district. You will coordinate between farmers, processing centers, and export partners to ensure seamless delivery of produce.',
      requirements: '- Bachelor\'s degree in Business, Logistics, or related field\n- Minimum 5 years experience in supply chain management\n- Willingness to travel frequently across rural districts\n- Strong negotiation and vendor management skills',
      benefits: '- Vehicle allowance\n- Performance-based annual bonus\n- Comprehensive medical coverage\n- 21 days paid annual leave',
      category: 'Agriculture',
      location: 'Kenema',
      type: 'FULL_TIME',
      salaryMin: 18000,
      salaryMax: 25000,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      companyId: company2.id,
    }
  })

  await prisma.job.create({
    data: {
      title: 'Financial Analyst / Risk Consultant',
      description: 'Join Freetown Trust Bank as a Financial Analyst. You will be responsible for evaluating corporate credit applications, conducting market risk assessments, and preparing financial models for the executive board.',
      requirements: '- CFA Level 1 or equivalent certification\n- Advanced proficiency in Excel and financial modeling\n- Minimum 3 years experience in banking or corporate finance\n- Impeccable attention to detail',
      benefits: '- Highly competitive banking sector salary\n- Preferential employee loan rates\n- Premium health and dental insurance\n- Clear pathway to senior management',
      category: 'Finance & Banking',
      location: 'Freetown',
      type: 'FULL_TIME',
      salaryMin: 20000,
      salaryMax: 35000,
      deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      status: 'ACTIVE',
      companyId: company3.id,
    }
  })

  console.log('Seeded 3 jobs successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
