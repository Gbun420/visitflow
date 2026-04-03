import { Header } from '@/components/header'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-primary">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6 font-mono text-xs uppercase tracking-widest">Last Updated: April 3, 2026</p>
        
        <div className="space-y-8 text-foreground/80 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">1. Framework</h2>
            <p>
              VisitFlow Technologies (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to the highest standards of data protection and privacy. This policy outlines our protocols for the collection, utilization, and safeguarding of information within our multi-tenant payroll infrastructure, maintaining alignment with global data protection standards, including the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">2. Information Collection</h2>
            <p className="mb-4">We ingest data provided directly through administrative interfaces during account initialization and workforce configuration:</p>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li><strong>Corporate Identity:</strong> Legal name, registration identifiers, tax documentation, and localized jurisdictional data.</li>
              <li><strong>Workforce Capital Data:</strong> Identification markers, financial account specifications (IBAN/Routing), and tax identifiers.</li>
              <li><strong>Financial Parameters:</strong> Compensation structures, incentive frameworks, and regulatory contribution data.</li>
              <li><strong>Audit Infrastructure:</strong> IP addresses, cryptographic signatures, and device telemetry for security verification.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">3. Operational Utilization</h2>
            <ul className="list-disc pl-6 space-y-2 font-medium">
              <li>Provisioning of multi-tenant workforce capital management systems.</li>
              <li>Automation of regulatory compliance calculations across diverse jurisdictions.</li>
              <li>Generation of itemized compensation documentation and fiscal reports.</li>
              <li>Enforcement of mathematical data isolation between corporate tenants.</li>
              <li>Integration with verified financial settlement providers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">4. Cryptographic Security</h2>
            <p>
              Our architecture implements zero-trust protocols. Critical data points are protected via AES-256-GCM encryption at rest. Multi-tenancy is enforced through ORM-level mathematical isolation, ensuring cryptographic separation of all tenant environments.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-4 text-foreground uppercase tracking-wider">5. Data Sovereignty</h2>
            <p>
              Users maintain full sovereignty over their data. Requests for access, rectification, or erasure of personal data under relevant legal frameworks can be directed to our privacy infrastructure at support@visitflow.io.
            </p>
          </section>

          <section className="pt-8 border-t border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Communications regarding this policy should be directed to <Link href="mailto:support@visitflow.io" className="text-primary hover:underline">support@visitflow.io</Link>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
