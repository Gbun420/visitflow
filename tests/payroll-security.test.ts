import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEmployeePromptContext } from '../lib/payroll/employee-context.ts'
import { recalculatePayrollRun } from '../lib/payroll/recalculate-run.ts'

test('employee prompt context is omitted when the employee belongs to another company', () => {
  const context = buildEmployeePromptContext(
    {
      id: 'emp_123',
      companyId: 'company_abc',
      firstName: 'Jane',
      lastName: 'Doe',
      salaryGross: 48000,
      employmentType: 'FULL_TIME',
    },
    'company_xyz'
  )

  assert.equal(context, null)
})

test('employee prompt context is included for the authenticated company', () => {
  const context = buildEmployeePromptContext(
    {
      id: 'emp_123',
      companyId: 'company_abc',
      firstName: 'Jane',
      lastName: 'Doe',
      salaryGross: 48000,
      employmentType: 'FULL_TIME',
    },
    'company_abc'
  )

  assert.match(context ?? '', /Jane Doe/)
  assert.match(context ?? '', /€48000/)
})

test('payroll recalculation fails the run when any entry calculation fails', async () => {
  const updateCalls: Array<{ where: { id: string }; data: { status: string } }> = []
  const prisma = {
    payrollRun: {
      findFirst: async () => ({
        id: 'run_123',
        companyId: 'company_abc',
        periodStart: new Date('2026-01-01'),
        periodEnd: new Date('2026-01-31'),
        status: 'DRAFT',
        entries: [
          {
            id: 'entry_ok',
            employee: {
              id: 'emp_ok',
              salaryGross: 42000,
            },
          },
          {
            id: 'entry_fail',
            employee: {
              id: 'emp_fail',
              salaryGross: 50000,
            },
          },
        ],
      }),
      update: async (args: { where: { id: string }; data: { status: string } }) => {
        updateCalls.push(args)
        return args
      },
    },
    payrollEntry: {
      update: async () => undefined,
    },
    contribution: {
      deleteMany: async () => undefined,
      createMany: async () => undefined,
    },
  }

  await assert.rejects(
    () =>
      recalculatePayrollRun({
        prisma,
        companyId: 'company_abc',
        runId: 'run_123',
        calculatePayrollEntry: async ({ employeeId }: { employeeId: string }) => {
          if (employeeId === 'emp_fail') {
            throw new Error('calculation failed')
          }

          return {
            grossPeriod: 3500,
            tax: 700,
            socialSecurityEmployee: 200,
            socialSecurityEmployer: 400,
            netPay: 2600,
            totalCost: 3900,
            notes: 'ok',
          }
        },
      }),
    /Failed to recalculate payroll run/
  )

  assert.equal(updateCalls.length, 0)
})
