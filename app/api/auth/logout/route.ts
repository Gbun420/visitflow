import { NextResponse } from 'next/server'
import { resolvePublicUrl } from '@/lib/url-resolver'

export async function POST() {
  const callbackUrl = resolvePublicUrl() || 'https://payrollpal.mt'
  
  // Use manual string construction to avoid new URL() build-time issues
  const signOutUrl = `${callbackUrl}/api/auth/signout?callbackUrl=${encodeURIComponent(callbackUrl)}`

  return NextResponse.redirect(signOutUrl, {
    status: 303,
  })
}
