import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateJSON } from '@/lib/openai'
import { getCompanyIdFromUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// POST /api/payroll/ask
// Body: { question, companyId [, employeeId] }
export async function POST(req: NextRequest) {
  try {
    const companyIdFromUser = await getCompanyIdFromUser()
    if (!companyIdFromUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { question, companyId, employeeId } = await req.json()
    if (!question || !companyId) {
      return NextResponse.json({ error: 'question and companyId required' }, { status: 400 })
    }
    if (companyId !== companyIdFromUser) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const company = await prisma.company.findUnique({ where: { id: companyId } })
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    let employeeContext = ''
    if (employeeId) {
      const emp = await prisma.employee.findUnique({ where: { id: employeeId } })
      if (emp) employeeContext = `Employee: ${emp.firstName} ${emp.lastName}, Gross: €${emp.salaryGross}/yr, Type: ${emp.employmentType}`
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
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
