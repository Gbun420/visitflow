type PayrollEmployee = {
  id?: string
  companyId: string
  employmentType: string
  firstName: string
  lastName: string
  salaryGross: number | string
}

export function buildEmployeePromptContext(
  employee: PayrollEmployee | null,
  companyId: string
) {
  if (!employee || employee.companyId !== companyId) {
    return null
  }

  return `Employee: ${employee.firstName} ${employee.lastName}, Gross: €${Number(employee.salaryGross)}/yr, Type: ${employee.employmentType}`
}
