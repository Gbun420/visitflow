import { NextResponse } from 'next/server'
import { resolvePublicUrl } from '@/lib/url-resolver'

export async function POST() {
  const callbackUrl = resolvePublicUrl()
  const signOutUrl = new URL('/api/auth/signout', callbackUrl)
  signOutUrl.searchParams.set('callbackUrl', callbackUrl)

  return NextResponse.redirect(signOutUrl, {
    status: 303,
  })
}
