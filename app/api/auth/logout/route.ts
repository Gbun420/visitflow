import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()

  // 1. Log out from Supabase (clears server-side and browser sessions)
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
  }

  // 2. Redirect to login
  const url = new URL(request.url)
  return NextResponse.redirect(new URL('/login', url.origin), {
    status: 303, // See Other (standard for POST-redirect)
  })
}
