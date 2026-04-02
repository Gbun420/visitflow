import { resolvePublicUrl } from '../url-resolver.ts'

type AuthErrorLike = {
  message?: string | null
  status?: number | null
  code?: string | null
}

const EMAIL_DELIVERY_BLOCKED_CODES = new Set([
  'email_address_not_authorized',
  'email_provider_disabled',
  'over_email_send_rate_limit',
])

export function isEmailConfirmationRequiredError(
  error: AuthErrorLike | null | undefined
) {
  return (
    error?.code === 'email_not_confirmed' ||
    (error?.status === 400 &&
      typeof error.message === 'string' &&
      (() => {
        const message = error.message.toLowerCase()
        return (
          message.includes('email not confirmed') ||
          message.includes('not confirmed') ||
          message.includes('confirm your email') ||
          message.includes('email confirmation')
        )
      })())
  )
}

export function buildVerifyEmailUrl(email?: string) {
  const url = new URL('/verify-email', resolvePublicUrl())
  const normalizedEmail = email?.trim()

  if (normalizedEmail) {
    url.searchParams.set('email', normalizedEmail)
  }

  return url.toString()
}

export function buildVerifyEmailPath(email?: string) {
  const url = new URL(buildVerifyEmailUrl(email))
  return `${url.pathname}${url.search}${url.hash}`
}

export function isEmailDeliveryBlockedError(
  error: AuthErrorLike | null | undefined
) {
  return error?.code ? EMAIL_DELIVERY_BLOCKED_CODES.has(error.code) : false
}

export function getEmailDeliveryIssueMessage(
  error: AuthErrorLike | null | undefined
) {
  switch (error?.code) {
    case 'email_address_not_authorized':
      return 'Supabase can only send auth emails to members of your Supabase organization until you configure custom SMTP.'
    case 'over_email_send_rate_limit':
      return 'Supabase has rate-limited auth emails. Wait a bit and try again, or configure custom SMTP for production.'
    case 'email_provider_disabled':
      return 'Email auth is disabled in Supabase. Enable the Email provider and SMTP settings in the Supabase dashboard.'
    default:
      return 'We could not send the auth email right now. Check your Supabase email settings or try again later.'
  }
}
