import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolvePublicUrl, resolveSafeNextPath } from '../url-resolver.ts'

const EMAIL_OTP_TYPES: EmailOtpType[] = [
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]

function parseEmailOtpType(value: string | null): EmailOtpType | null {
  if (!value) {
    return null
  }

  return EMAIL_OTP_TYPES.includes(value as EmailOtpType)
    ? (value as EmailOtpType)
    : null
}

export function buildAuthRedirectUrl(pathname: string) {
  return new URL(pathname, resolvePublicUrl())
}

export async function completeAuthRedirect(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const next = resolveSafeNextPath(searchParams.get('next'), '/dashboard')
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const emailOtpType = parseEmailOtpType(searchParams.get('type')) ?? 'email'
  const supabase = createClient()

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(buildAuthRedirectUrl(next))
    }
  }

  if (tokenHash) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: emailOtpType,
    })

    if (!error) {
      return NextResponse.redirect(buildAuthRedirectUrl(next))
    }
  }

  return NextResponse.redirect(
    buildAuthRedirectUrl('/auth/auth-code-error')
  )
}

export { resolveSafeNextPath }
