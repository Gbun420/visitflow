'use server'

import { z } from 'zod'
import { getEnhancedPrisma } from '@/lib/zenstack'
import { revalidatePath } from 'next/cache'
import { getCompanyIdFromUser } from '@/lib/auth'
import { EmployeeSchema, EmployeeFormValues } from '@/lib/schemas/employee'

export async function addEmployee(data: EmployeeFormValues) {
  const companyId = await getCompanyIdFromUser()
  
  if (!companyId) {
    return { error: 'Unauthorized: No company found' }
  }

  const prisma = await getEnhancedPrisma()

  try {
    const validatedData = EmployeeSchema.parse(data)
    
    await prisma.employee.create({
      data: {
        ...validatedData,
        salaryGross: validatedData.salary, // Map to salaryGross
        companyId,
        startDate: new Date(validatedData.startDate),
      },
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/employees')
    
    return { success: true }
  } catch (error: any) {
    console.error('Add employee error:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Validation failed', details: error.flatten().fieldErrors }
    }
    return { error: error.message || 'Failed to add employee' }
  }
}
