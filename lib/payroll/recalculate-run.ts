type RecalculateRunDependencies = {
  prisma: any
  companyId: string
  runId: string
  calculatePayrollEntry: (args: {
    companyId: string
    employeeId: string
    periodStart: Date
    periodEnd: Date
    salaryGross: number
    benefits: unknown[]
    oneTimeAdjustments: unknown[]
  }) => Promise<{
    grossPeriod: number
    tax: number
    socialSecurityEmployee: number
    socialSecurityEmployer: number
    netPay: number
    totalCost: number
    notes: string | null
  }>
}

export async function recalculatePayrollRun({
  prisma,
  companyId,
  runId,
  calculatePayrollEntry,
}: RecalculateRunDependencies) {
  const run = await prisma.payrollRun.findFirst({
    where: { id: runId, companyId },
    include: { entries: { include: { employee: { select: { id: true, salaryGross: true } } } } },
  })

  if (!run) {
    throw new Error('Not found')
  }

  if (run.status === 'SUBMITTED') {
    throw new Error('Already submitted')
  }

  const results: Array<
    | {
        entryId: string
        result: Awaited<ReturnType<typeof calculatePayrollEntry>>
      }
    | {
        entryId: string
        error: unknown
      }
  > = []

  for (const entry of run.entries) {
    try {
      const result = await calculatePayrollEntry({
        companyId: run.companyId,
        employeeId: entry.employee.id,
        periodStart: run.periodStart,
        periodEnd: run.periodEnd,
        salaryGross: Number(entry.employee.salaryGross),
        benefits: [],
        oneTimeAdjustments: [],
      })

      results.push({ entryId: entry.id, result })
    } catch (error) {
      results.push({ entryId: entry.id, error })
    }
  }

  const failures = results.filter(
    (item): item is Extract<(typeof results)[number], { error: unknown }> =>
      'error' in item
  )

  if (failures.length > 0) {
    const details = failures
      .map(({ entryId, error }) => {
        const message = error instanceof Error ? error.message : String(error)
        return `entry ${entryId}: ${message}`
      })
      .join('; ')

    throw new Error(`Failed to recalculate payroll run: ${details}`)
  }

  for (const item of results) {
    if (!('result' in item)) {
      continue
    }

    await prisma.payrollEntry.update({
      where: { id: item.entryId },
      data: {
        salaryGross: item.result.grossPeriod,
        tax: item.result.tax,
        socialSecurity: item.result.socialSecurityEmployee,
        netPay: item.result.netPay,
        totalCost: item.result.totalCost,
        notes: item.result.notes,
      },
    })

    await prisma.contribution.deleteMany({ where: { payrollEntryId: item.entryId } })
    await prisma.contribution.createMany({
      data: [
        {
          payrollEntryId: item.entryId,
          type: 'MSSS_EMPLOYEE',
          amount: item.result.socialSecurityEmployee,
          description: 'Employee MSSS contribution',
        },
        {
          payrollEntryId: item.entryId,
          type: 'MSSS_EMPLOYER',
          amount: item.result.socialSecurityEmployer,
          description: 'Employer MSSS contribution',
        },
      ],
    })
  }

  await prisma.payrollRun.update({
    where: { id: runId },
    data: { status: 'CALCULATED' },
  })

  return { success: true, processedEntries: results.length }
}
