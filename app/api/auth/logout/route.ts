import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { resolvePublicUrl } from '@/lib/url-resolver'

export async function POST() {
  const supabase = createClient()

  // 1. Log out from Supabase (clears server-side and browser sessions)
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error.message)
  }

  // 2. Redirect to login
  return NextResponse.redirect(new URL('/login', resolvePublicUrl()), {
    status: 303, // See Other (standard for POST-redirect)
  })
}
