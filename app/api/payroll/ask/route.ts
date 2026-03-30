import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'
import { openai, generateJSON } from '@/lib/openai'

async function getCompanyIdFromUser(req: NextRequest): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { cookie: req.headers.get('cookie') ?? '' } },
  })
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const appUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!appUser || appUser.companies.length === 0) return null
  const company = appUser.companies[0]
  if (company.status !== 'ACTIVE') return null
  return company.id
}

// POST /api/payroll/ask
// Body: { question, companyId [, employeeId] }
export async function POST(req: NextRequest) {
  try {
    const companyIdFromUser = await getCompanyIdFromUser(req)
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
      take: 5, // only top 5 brackets to control context
    })
    const ssRate = await prisma.socialSecurityRate.findFirst({ where: { year: currentYear } })

    const prompt = `
Answer the user's payroll question for Malta concisely.

Company: ${company.name}
${employeeContext}

Malta Tax (sample brackets): ${JSON.stringify(taxBrackets.map(b => ({ rate: b.rate, min: b.minIncome })))}
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
