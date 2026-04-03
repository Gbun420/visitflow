import { task, logger } from "@trigger.dev/sdk/v3";
import { prisma } from "@/lib/prisma";
import { Resend } from 'resend';
import React from 'react';
import PayslipReady from "@/emails/PayslipReady";

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy');

export const runPayrollTask = task({
  id: "run-payroll",
  run: async (payload: { companyId: string }) => {
    const { companyId } = payload;

    if (!process.env.RESEND_API_KEY) {
      logger.warn("RESEND_API_KEY not set, emails will not be sent.");
    }

    // 1. Fetch all employees for this company
    const employees = await prisma.employee.findMany({
      where: { companyId },
    });

    if (employees.length === 0) {
      return { success: false, message: "No employees found for this company." };
    }

    // 2. Create a new PayrollRun record
    const payrollRun = await prisma.payrollRun.create({
      data: {
        companyId,
        periodStart: new Date(), // Mocking current period
        periodEnd: new Date(),
        status: "DRAFT",
      },
    });

    let totalGross = 0;
    let totalTax = 0;
    let totalNet = 0;
    let emailSuccessCount = 0;
    let emailErrorCount = 0;

    // 3. Process each employee
    for (const employee of employees) {
      const annualSalary = Number(employee.salaryGross) || Number(employee.salary) || 0;
      const monthlyGross = annualSalary / 12;
      const taxRate = 0.20; // 20% flat tax for MVP
      const taxAmount = monthlyGross * taxRate;
      const netPay = monthlyGross - taxAmount;

      const entry = await prisma.payrollEntry.create({
        data: {
          payrollRunId: payrollRun.id,
          employeeId: employee.id,
          salaryGross: monthlyGross,
          tax: taxAmount,
          socialSecurity: 0,
          netPay: netPay,
          totalCost: monthlyGross,
          notes: "Processed via background job",
        },
      });

      totalGross += monthlyGross;
      totalTax += taxAmount;
      totalNet += netPay;

      // 4. Send Email Notification
      try {
        await resend.emails.send({
          from: 'VisitFlow Payroll <onboarding@resend.dev>',
          to: employee.email,
          subject: 'Your New Payslip is Ready',
          react: React.createElement(PayslipReady, {
            employeeName: `${employee.firstName} ${employee.lastName}`,
            periodStart: payrollRun.periodStart,
            periodEnd: payrollRun.periodEnd,
            downloadUrl: `https://visitflow-lovat.vercel.app/api/payslips/${entry.id}`,
          }),
        });
        emailSuccessCount++;
      } catch (error) {
        logger.error(`Failed to send payslip email to ${employee.email}`, { error });
        emailErrorCount++;
      }
    }

    // 5. Update the PayrollRun status to CALCULATED
    await prisma.payrollRun.update({
      where: { id: payrollRun.id },
      data: { status: "CALCULATED" },
    });

    return {
      success: true,
      processedCount: employees.length,
      emailsSent: emailSuccessCount,
      emailErrors: emailErrorCount,
      summary: {
        totalGross,
        totalTax,
        totalNet,
      },
    };
  },
});
