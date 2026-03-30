import { prisma } from '@/lib/prisma'
import { generateJSON } from '@/lib/openai'

export interface PayrollCalcInput {
  companyId: string
  employeeId: string
  periodStart: Date
  periodEnd: Date
  salaryGross: number
  benefits?: any[]
  oneTimeAdjustments?: any[]
}

export interface PayrollCalcResult {
  grossPeriod: number
  tax: number
  socialSecurityEmployee: number
  socialSecurityEmployer: number
  netPay: number
  totalCost: number
  breakdown: {
    tax: number
    ssEmployee: number
    ssEmployer: number
    benefits: number
  }
  notes: string
}

export async function calculatePayrollEntry(input: PayrollCalcInput): Promise<PayrollCalcResult> {
  const { companyId, employeeId, periodStart, periodEnd, salaryGross, benefits = [], oneTimeAdjustments = [] } = input

  // Fetch employee + company data
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: { company: true, benefits: true },
  })
  if (!employee || employee.companyId !== companyId) {
    throw new Error('Employee not found or access denied')
  }

  // Fetch tax & SS rates
  const taxYear = periodStart.getFullYear()
  const taxBrackets = await prisma.taxBracket.findMany({
    where: { year: taxYear },
    orderBy: { minIncome: 'asc' },
  })
  const ssRate = await prisma.socialSecurityRate.findFirst({
    where: { year: taxYear },
  })

  const prompt = `
Malta Payroll Calculation

Employee: ${employee.firstName} ${employee.lastName}
Gross Annual Salary: €${salaryGross}
Period: ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}
Employment Type: ${employee.employmentType}
Benefits: ${JSON.stringify(benefits)}
One-time Adjustments: ${JSON.stringify(oneTimeAdjustments)}

Malta Tax Brackets ${taxYear}:
${JSON.stringify(taxBrackets, null, 2)}

MSSS Rates:
Employee: ${ssRate?.employeeRate}%, Employer: ${ssRate?.employerRate}%
Weekly Cap: €${ssRate?.maxWeeklyEarning}

Calculate:
1. Gross pay for this period (prorated)
2. Tax due for this period (cumulative method)
3. MSSS employee contribution (capped)
4. Net pay = gross - tax - employee ss
5. Employer total cost = gross + employer ss
6. Notes

JSON:
{
  "grossPeriod": number,
  "tax": number,
  "socialSecurityEmployee": number,
  "socialSecurityEmployer": number,
  "netPay": number,
  "totalCost": number,
  "breakdown": { "tax": number, "ssEmployee": number, "ssEmployer": number, "benefits": number },
  "notes": string
}
`
  const result = await generateJSON<PayrollCalcResult>(prompt, 'You are a Maltese payroll accountant. Use Malta Commissioner for Revenue rules.')

  return result
}
