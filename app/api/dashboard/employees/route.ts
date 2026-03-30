import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

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

// GET /api/dashboard/employees?companyId=...
export async function GET(req: NextRequest) {
  const companyId = await getCompanyIdFromUser(req)
  if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const employees = await prisma.employee.findMany({ where: { companyId } })
  return NextResponse.json(employees)
}

// POST /api/dashboard/employees
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser(req)
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { firstName, lastName, email, iban, taxId, employmentType, salaryGross, startDate } = await req.json()
    const emp = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        iban,
        taxId,
        employmentType,
        salaryGross: Number(salaryGross),
        startDate: startDate ? new Date(startDate) : new Date(),
        companyId,
      },
    })
    return NextResponse.json(emp)
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// DELETE /api/dashboard/employees
export async function DELETE(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser(req)
    if (!companyId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    // Ensure employee belongs to company
    const emp = await prisma.employee.findFirst({ where: { id, companyId } })
    if (!emp) return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
    await prisma.employee.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
