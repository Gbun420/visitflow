import { Html, Head, Preview, Body, Container, Section, Text, Button, Hr, Tailwind } from '@react-email/components';
import * as React from 'react';

interface PayslipReadyProps {
  employeeName: string;
  periodStart: Date;
  periodEnd: Date;
  downloadUrl: string;
}

export default function PayslipReady({
  employeeName = "Team Member",
  periodStart = new Date(),
  periodEnd = new Date(),
  downloadUrl = "https://visitflow-lovat.vercel.app/login",
}: PayslipReadyProps) {
  // Format dates for Malta (dd/mm/yyyy)
  const formattedStart = periodStart.toLocaleDateString('en-MT');
  const formattedEnd = periodEnd.toLocaleDateString('en-MT');

  return (
    <Html>
      <Head />
      <Preview>Your VisitFlow payslip is ready for download.</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="bg-white border border-slate-200 rounded-lg shadow-sm mx-auto p-8 mt-10 max-w-md">
            <Text className="text-2xl font-bold text-slate-900 mb-4">Your Payslip is Ready 📄</Text>
            <Text className="text-slate-600 text-base mb-6">
              Hi {employeeName}, your payroll for the period of <strong>{formattedStart} to {formattedEnd}</strong> has been successfully processed. Your itemized, legally-compliant payslip is now available.
            </Text>
            <Section className="text-center mb-6">
              <Button 
                href={downloadUrl}
                className="bg-slate-900 text-white font-semibold rounded-md py-3 px-6 w-full text-center block"
              >
                Download PDF Payslip
              </Button>
            </Section>
            <Text className="text-slate-500 text-sm mb-4">
              If you have any questions regarding your hours, tax (FSS), or National Insurance (SSC) deductions, please contact your HR administrator directly.
            </Text>
            <Hr className="border-slate-200 my-6" />
            <Text className="text-slate-400 text-xs text-center">
              Securely processed by VisitFlow
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
