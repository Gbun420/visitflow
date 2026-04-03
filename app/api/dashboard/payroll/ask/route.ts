import { NextRequest, NextResponse } from 'next/server'
import { generateJSON } from '@/lib/openai'
import { buildEmployeePromptContext } from '@/lib/payroll/employee-context'
import { getEnhancedPrisma } from '@/lib/zenstack'

export const dynamic = 'force-dynamic'

// POST /api/payroll/ask
// Body: { question [, employeeId] }
export async function POST(req: NextRequest) {
  try {
    const prisma = await getEnhancedPrisma()
    const { question, employeeId } = await req.json()

    if (!question) {
      return NextResponse.json({ error: 'question required' }, { status: 400 })
    }

    // ZenStack will restrict this to the user's company
    const company = await prisma.company.findFirst()
    if (!company) return NextResponse.json({ error: 'Unauthorized or Company not found' }, { status: 401 })

    let employeeContext = ''
    if (employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: employeeId } })
      const context = buildEmployeePromptContext(emp, company.id)
      if (context) employeeContext = context
    }

    const currentYear = new Date().getFullYear()
    const taxBrackets = await prisma.taxBracket.findMany({
      where: { year: currentYear },
      orderBy: { minIncome: 'asc' },
      take: 5,
    })
    const ssRate = await prisma.socialSecurityRate.findFirst({ where: { year: currentYear } })

    const prompt = `
Answer the user's payroll question for Malta concisely.

Company: ${company.name}
${employeeContext}

Malta Tax (sample brackets): ${JSON.stringify(taxBrackets.map((b: any) => ({ rate: b.rate, min: b.minIncome })))}

MSSS: Employee ${ssRate?.employeeRate}%, Employer ${ssRate?.employerRate}%, Cap €${ssRate?.maxWeeklyEarning}/wk

Question: "${question}"

Respond as JSON exactly:
{
  "answer": "string",
  "calculation": { "gross": number|null, "net": number|null, "tax": number|null, "ssEmployee": number|null, "ssEmployer": number|null } | null,
  "confidence": "high"|"medium"|"low",
  "needsHumanReview": boolean
}
`
    const result = await generateJSON<{
      answer: string
      calculation: { gross: number | null; net: number | null; tax: number | null; ssEmployee: number | null; ssEmployer: number | null } | null
      confidence: 'high' | 'medium' | 'low'
      needsHumanReview: boolean
    }>(prompt, 'You are a Maltese payroll expert. Keep answers brief and actionable.')

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Payroll ask error:', error)
    return NextResponse.json({ error: 'Unable to answer payroll question right now' }, { status: 500 })
  }
}
