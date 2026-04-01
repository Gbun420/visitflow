import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">
          PayrollPal Malta
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="underline">Log in</Link>
          <Link href="/signup" className="rounded-md bg-primary px-3 py-1 text-primary-foreground">
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  )
}
