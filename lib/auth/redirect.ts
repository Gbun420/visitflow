import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EMAIL_OTP_TYPES: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

function getSafeNextPath(value: string | null, fallback: string) {
  if (!value) {
    return fallback
  }

  if (!value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }

  return value
}

function parseEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value) {
    return null
  }

  return EMAIL_OTP_TYPES.includes(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null
}

export function buildAuthRedirectUrl(request: NextRequest, pathname: string) {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const origin =
    process.env.NODE_ENV === 'development'
      ? request.nextUrl.origin
      : forwardedHost
        ? `https://${forwardedHost}`
        : request.nextUrl.origin

  return new URL(pathname, origin)
}

export async function completeAuthRedirect(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = getSafeNextPath(searchParams.get('next'), '/dashboard')
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const emailOtpType = parseEmailOtpType(searchParams.get('type')) ?? 'email'
  const supabase = createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(buildAuthRedirectUrl(request, next))
    }
  }

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: emailOtpType,
    })

    if (!error) {
      return NextResponse.redirect(buildAuthRedirectUrl(request, next))
    }
  }

  return NextResponse.redirect(
    buildAuthRedirectUrl(request, '/auth/auth-code-error')
  )
}
