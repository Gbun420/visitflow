import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCompanyIdFromUser } from '@/lib/auth'
import { encryptField } from '@/lib/encryption'

export const dynamic = 'force-dynamic'

// GET /api/dashboard/employees
export async function GET() {
  const companyId = await getCompanyIdFromUser()
  if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

  const employees = await prisma.employee.findMany({
    where: { companyId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      employmentType: true,
      salaryGross: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
    }
  })
  return NextResponse.json(employees)
}

// POST /api/dashboard/employees
export async function POST(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser()
    if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

    const { firstName, lastName, email, iban, taxId, employmentType, salaryGross, startDate } = await requestBody(req)
    
    const encryptedIban = encryptField(iban) || ''
    const encryptedTaxId = encryptField(taxId)
    
    const emp = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        iban: encryptedIban,
        taxId: encryptedTaxId,
        encVersion: "v1",
        employmentType,
        salaryGross: Number(salaryGross),
        startDate: startDate ? new Date(startDate) : new Date(),
        companyId,
      },
    })

    // Log Creation
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: 'employee_created',
        resource: 'Employee',
        resourceId: emp.id,
        metadata: { email: emp.email },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      }
    })

    return NextResponse.json({
      employee: {
        id: emp.id,
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        employmentType: emp.employmentType,
        salaryGross: emp.salaryGross,
        startDate: emp.startDate,
        endDate: emp.endDate,
        createdAt: emp.createdAt,
        updatedAt: emp.updatedAt,
      },
    })
  } catch (e: any) {
    console.error('Employee create error:', e)
    return NextResponse.json({ error: 'Unable to create employee right now' }, { status: 500 })
  }
}

// DELETE /api/dashboard/employees
export async function DELETE(req: NextRequest) {
  try {
    const companyId = await getCompanyIdFromUser()
    if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 404 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const emp = await prisma.employee.findFirst({ where: { id, companyId } })
    if (!emp) return NextResponse.json({ error: 'Not found or access denied' }, { status: 404 })
    
    await prisma.employee.delete({ where: { id } })

    // Log Deletion
    await prisma.auditEvent.create({
      data: {
        companyId,
        action: 'employee_deleted',
        resource: 'Employee',
        resourceId: id,
        metadata: { name: `${emp.firstName} ${emp.lastName}` },
        ip: req.headers.get('x-forwarded-for') || '0.0.0.0',
        userAgent: req.headers.get('user-agent'),
      }
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('Employee delete error:', e)
    return NextResponse.json({ error: 'Unable to delete employee right now' }, { status: 500 })
  }
}

async function requestBody(req: NextRequest) {
  return await req.json()
}
