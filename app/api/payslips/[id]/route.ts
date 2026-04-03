import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import MaltesePayslip, { PayslipData } from '@/components/pdf/MaltesePayslip';
import { getEnhancedPrisma } from '@/lib/zenstack';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const prisma = await getEnhancedPrisma();
  const entryId = params.id;

  try {
    // Fetch the payroll entry with related data
    // ZenStack automatically restricts this to the user's company
    const entry = await prisma.payrollEntry.findUnique({
      where: { id: entryId },
      include: {
        employee: true,
        payrollRun: {
          include: {
            company: {
              include: {
                owner: true
              }
            }
          }
        }
      }
    });

    if (!entry) {
      return new NextResponse('Payslip not found or access denied', { status: 404 });
    }

    const company = entry.payrollRun.company;
    const employee = entry.employee;

    // Map database record to PayslipData interface
    const mappedData: PayslipData = {
      company: {
        name: company.name,
        address: (company.address as any)?.street || 'Malta',
        registrationNumber: company.registrationNumber,
      },
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        id: employee.id,
        designation: (employee as any).designation || 'Employee',
        taxId: employee.taxId || undefined,
      },
      period: {
        startDate: entry.payrollRun.periodStart.toLocaleDateString('en-GB'),
        endDate: entry.payrollRun.periodEnd.toLocaleDateString('en-GB'),
        payDate: (entry.payrollRun.submittedAt || new Date()).toLocaleDateString('en-GB'),
      },
      hours: {
        normal: 160, // Mocked for MVP
        overtime: 0, // Mocked for MVP
      },
      leave: {
        used: 0, // Mocked for MVP
        balance: 24, // Mocked for MVP
      },
      financials: {
        basicWage: Number(entry.salaryGross),
        bonuses: 0,
        taxDeduction: Number(entry.tax),
        niDeduction: Number(entry.socialSecurity),
        sscEmployer: 0,
        netPay: Number(entry.netPay),
        totalGross: Number(entry.salaryGross),
      },
    };

    // Generate the PDF buffer
    const pdfBuffer = await renderToBuffer(React.createElement(MaltesePayslip, { data: mappedData }) as any);

    // Return as downloadable file
    return new NextResponse(pdfBuffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="payslip_${employee.lastName}_${entryId.substring(0, 8)}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
