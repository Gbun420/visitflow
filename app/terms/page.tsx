import { Header } from '@/components/header'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">Master Service Agreement</h1>
        <p className="text-muted-foreground mb-6 font-mono text-xs uppercase tracking-widest">Last Updated: April 3, 2026</p>
        
        <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">1. Master Agreement</h2>
            <p>
              By accessing or utilizing the VisitFlow infrastructure (&quot;the Service&quot;), you enter into a binding Master Service Agreement with VisitFlow Technologies. If you are executing this agreement on behalf of a corporate entity, you represent that you hold the requisite authority to bind such entity to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">2. System Specification</h2>
            <p>
              VisitFlow provides a high-availability, multi-tenant workforce capital management platform. Core specifications include automated regulatory calculations, cryptographic documentation generation, and fiscal auditing frameworks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">3. Client Obligations</h2>
            <p>Clients are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li>Input precision of corporate and workforce data.</li>
              <li>Integrity of authentication credentials and administrative access.</li>
              <li>Compliance with all jurisdictional labor and fiscal regulations applicable to their operations.</li>
              <li>Verification of system-generated reports prior to regulatory submission.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">4. Financial Terms</h2>
            <p>
              Access to infrastructure tiers is governed by subscription protocols. All financial transactions are processed through verified settlement providers. Fees are non-refundable unless specified otherwise by relevant jurisdictional law. VisitFlow reserves the right to adjust fiscal parameters with thirty (30) days notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">5. Liability Framework</h2>
            <p>
              VisitFlow is a tool for professional administrative assistance. Final regulatory compliance and legal accountability remain the sole responsibility of the Client. VisitFlow Technologies disclaims liability for fiscal penalties arising from data inaccuracies or jurisdictional misinterpretations.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Legal inquiries should be directed to <Link href="mailto:legal@visitflow.io" className="text-primary hover:underline">legal@visitflow.io</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
