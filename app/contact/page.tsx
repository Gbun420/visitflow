import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, MapPin, Building2 } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-4xl lg:text-6xl font-extrabold mb-4 text-primary tracking-tight">Contact Our Team</h1>
        <p className="text-xl text-muted-foreground mb-12 font-medium">Expert infrastructure support for the Maltese workforce ecosystem.</p>
        
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <Card className="border-2 shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Maltese Operations</CardTitle>
              <CardDescription>Direct access to our technical systems and compliance team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Channel</p>
                  <p className="font-bold">support@payrollpal.mt</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Corporate Office</p>
                  <p className="font-bold">Valletta, Malta</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Registry</p>
                  <p className="font-bold">C 1029384 (Draft Entry)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Request Briefing</CardTitle>
                <CardDescription className="text-primary-foreground/80 font-medium">
                  Experience the 2026 standard for automated Maltese payroll compliance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="mailto:sales@payrollpal.mt">
                  <button className="w-full bg-white text-primary font-black py-4 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm shadow-xl">
                    Initialize Consultation
                  </button>
                </Link>
              </CardContent>
            </Card>

            <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 mb-4">Support Protocol</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Active Professional and Enterprise clients have 24/7 access to priority channels for urgent processing inquiries and regulatory compliance support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
