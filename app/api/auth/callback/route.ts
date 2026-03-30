import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient(`${origin}/api/auth/callback`, origin)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
      const isLocal = forwardedHost?.includes('localhost') ?? false
      const redirectTo = isLocal ? 'http://localhost:3000' : `https://${forwardedHost}`
      return NextResponse.redirect(`${redirectTo}${next}`)
    }
  }

  // Return an error response if something goes wrong
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`)
}
