import { Header } from '@/components/header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Mail, MessageSquare, Shield } from 'lucide-react'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
        <h1 className="text-4xl lg:text-6xl font-extrabold mb-4 text-primary tracking-tight">Connect with Us</h1>
        <p className="text-xl text-muted-foreground mb-12">Expert infrastructure support for modern enterprises.</p>
        
        <div className="grid md:grid-cols-2 gap-8 text-left">
          <Card className="border-2 shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="text-2xl">Infrastructure Support</CardTitle>
              <CardDescription>Direct access to our technical systems team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email Ecosystem</p>
                  <p className="font-bold">systems@visitflow.io</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Global Sales</p>
                  <p className="font-bold">growth@visitflow.io</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Legal & Privacy</p>
                  <p className="font-bold">legal@visitflow.io</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="bg-primary text-white border-none shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Request System Demo</CardTitle>
                <CardDescription className="text-primary-foreground/80 font-medium">
                  Experience the precision of our asynchronous processing engine.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="mailto:growth@visitflow.io">
                  <button className="w-full bg-white text-primary font-black py-4 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-sm shadow-xl">
                    Initialize Demo Request
                  </button>
                </Link>
              </CardContent>
            </Card>

            <div className="p-8 rounded-3xl border-2 border-border bg-muted/30">
              <h3 className="font-black text-sm uppercase tracking-[0.2em] mb-4">Support Protocol</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Active enterprise clients should utilize their dedicated high-priority channels for 24/7 infrastructure monitoring and support.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
