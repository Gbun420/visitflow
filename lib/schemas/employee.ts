import { z } from 'zod'

export const EmployeeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  salary: z.number().positive('Salary must be a positive number'),
  iban: z.string().min(5, 'IBAN must be at least 5 characters'),
  taxId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  startDate: z.string().min(1, 'Start date is required'),
})

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>
