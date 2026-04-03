export function buildEmployeePromptContext(
  employee: any | null,
  companyId: string
) {
  if (!employee || employee.companyId !== companyId) {
    return null
  }

  return `Employee: ${employee.firstName} ${employee.lastName}, Gross: €${Number(employee.salaryGross)}/yr, Type: ${employee.employmentType}`
}
