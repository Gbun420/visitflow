import { Header } from '@/components/header'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl font-sans">
        <h1 className="text-4xl font-bold mb-8 text-primary tracking-tight">Data Protection Policy</h1>
        <p className="text-muted-foreground mb-6 font-mono text-[10px] uppercase tracking-widest font-bold">Last Updated: April 3, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">1. Privacy Protocols</h2>
            <p>
              PayrollPal Malta Technologies (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates under the strict protocols defined by the Malta Data Protection Act (Cap. 586) and the General Data Protection Regulation (GDPR). This policy details our commitment to the cryptographic security and privacy of your corporate workforce data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">2. Data Ingestion & Processing</h2>
            <p className="mb-4">We process information essential for the execution of Maltese payroll cycles:</p>
            <ul className="list-disc pl-6 space-y-2 font-medium text-slate-700">
              <li><strong>Corporate Identity:</strong> PE Number, VAT registration, and fiscal documentation.</li>
              <li><strong>Workforce Identity:</strong> Identification Card (ID) numbers, tax statuses, and IBAN specifications.</li>
              <li><strong>Financial Parameters:</strong> Gross compensation, benefit valuations, and FSS/SSC historical data.</li>
              <li><strong>System Auditing:</strong> Log signatures, IP telemetry, and administrative access records.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">3. Processing Objectives</h2>
            <ul className="list-disc pl-6 space-y-2 font-medium text-slate-700">
              <li>Calculation of 2026 FSS Tax and Social Security contributions.</li>
              <li>Automation of itemised payslips and statutory reporting (FS3, FS5).</li>
              <li>Maintenance of zero-trust multi-tenant isolation protocols.</li>
              <li>Cryptographic protection of sensitive workforce financial markers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">4. Cryptographic Security Standards</h2>
            <p>
              Our infrastructure employs ORM-level mathematical isolation to ensure absolute data separation between tenants. Sensitive workforce identifiers are encrypted using AES-256-GCM standards at the persistence layer.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Privacy Officer: <Link href="mailto:privacy@payrollpal.mt" className="text-primary hover:underline">privacy@payrollpal.mt</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
