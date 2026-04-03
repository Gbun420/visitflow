import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Image src="/icon.svg" alt="VisitFlow Logo" width={32} height={32} className="rounded-md" />
          <span>VisitFlow</span>
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Log in
          </Link>
          <Link href="/signup">
            <Button size="sm" className="font-semibold">
              Get Started
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
