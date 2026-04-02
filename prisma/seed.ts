import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Malta Tax Data (2025)...')

  // 1. Tax Brackets (2025)
  // Single Computation
  const singleBrackets = [
    { year: 2025, minIncome: 0, maxIncome: 12000, rate: 0 },
    { year: 2025, minIncome: 12001, maxIncome: 16000, rate: 0.15 },
    { year: 2025, minIncome: 16001, maxIncome: 60000, rate: 0.25 },
    { year: 2025, minIncome: 60001, maxIncome: null, rate: 0.35 },
  ]

  // Married Computation
  const marriedBrackets = [
    { year: 2025, minIncome: 0, maxIncome: 15000, rate: 0 },
    { year: 2025, minIncome: 15001, maxIncome: 23000, rate: 0.15 },
    { year: 2025, minIncome: 23001, maxIncome: 60000, rate: 0.25 },
    { year: 2025, minIncome: 60001, maxIncome: null, rate: 0.35 },
  ]

  // Parent Computation
  const parentBrackets = [
    { year: 2025, minIncome: 0, maxIncome: 13000, rate: 0 },
    { year: 2025, minIncome: 13001, maxIncome: 17500, rate: 0.15 },
    { year: 2025, minIncome: 17501, maxIncome: 60000, rate: 0.25 },
    { year: 2025, minIncome: 60001, maxIncome: null, rate: 0.35 },
  ]

  // Upsert all brackets
  for (const b of [...singleBrackets, ...marriedBrackets, ...parentBrackets]) {
    await prisma.taxBracket.upsert({
      where: {
        year_minIncome: {
          year: b.year,
          minIncome: b.minIncome,
        },
      },
      update: {
        maxIncome: b.maxIncome,
        rate: b.rate,
        effectiveFrom: new Date('2025-01-01'),
      },
      create: {
        year: b.year,
        minIncome: b.minIncome,
        maxIncome: b.maxIncome,
        rate: b.rate,
        effectiveFrom: new Date('2025-01-01'),
      },
    })
  }

  // 2. Social Security Rates (2025)
  // Standard Class 1 for those born after 1962
  await prisma.socialSecurityRate.upsert({
    where: { year: 2025 },
    update: {
      employeeRate: 0.10,
      employerRate: 0.10,
      maxWeeklyEarning: 535.30, // Approx standard max weekly
      effectiveFrom: new Date('2025-01-01'),
    },
    create: {
      year: 2025,
      employeeRate: 0.10,
      employerRate: 0.10,
      maxWeeklyEarning: 535.30,
      effectiveFrom: new Date('2025-01-01'),
    },
  })

  console.log('Seeding completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
