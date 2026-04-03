import { Header } from '@/components/header'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl font-sans">
        <h1 className="text-4xl font-bold mb-8 text-primary tracking-tight">Master Service Agreement</h1>
        <p className="text-muted-foreground mb-6 font-mono text-[10px] uppercase tracking-widest font-bold">Last Updated: April 3, 2026</p>
        
        <div className="space-y-8 text-slate-600 leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">1. Agreement Scope</h2>
            <p>
              By accessing the PayrollPal Malta infrastructure (&quot;the Service&quot;), you enter into a binding Master Service Agreement with PayrollPal Malta Technologies. This agreement governs your use of our automated Maltese payroll systems and compliance frameworks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">2. System Specification</h2>
            <p>
              PayrollPal Malta provides a high-availability, multi-tenant workforce capital management platform specifically tailored for the Maltese regulatory environment. Core features include automated FSS/MSSS calculations, FS3/FS5 generation, and asynchronous processing engines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">3. Regulatory Compliance</h2>
            <p>Clients are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li>Accuracy of organization and employee data entry.</li>
              <li>Compliance with the Employment and Industrial Relations Act (Cap. 452).</li>
              <li>Verification of FSS tax and Social Security contributions prior to submission.</li>
              <li>Adherence to Legal Notice 274 of 2018 regarding itemised payslips.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">4. Jurisdictional Data</h2>
            <p>
              The Service is optimized for entities operating within the jurisdiction of Malta. All calculations are performed based on the 2026 fiscal standards provided by the Malta Commissioner for Revenue.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-4 text-slate-900 uppercase tracking-wider">5. Liability Framework</h2>
            <p>
              PayrollPal Malta is a precision tool for administrative assistance. Ultimate legal accountability for tax filings and workforce payments remains with the Client. PayrollPal Malta Technologies disclaims liability for penalties arising from jurisdictional misinterpretations.
            </p>
          </section>

          <section className="pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
              Legal inquiries: <Link href="mailto:legal@payrollpal.mt" className="text-primary hover:underline">legal@payrollpal.mt</Link>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
