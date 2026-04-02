import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildVerifyEmailUrl,
  getEmailDeliveryIssueMessage,
  isEmailDeliveryBlockedError,
  isEmailConfirmationRequiredError,
} from '../lib/auth/confirmation.ts'

test('detects the Supabase email confirmation error', () => {
  assert.equal(
    isEmailConfirmationRequiredError({
      status: 400,
      code: 'email_not_confirmed',
      message: 'Email not confirmed',
    }),
    true
  )
})

test('does not treat generic login failures as email confirmation errors', () => {
  assert.equal(
    isEmailConfirmationRequiredError({
      status: 400,
      message: 'Invalid login credentials',
    }),
    false
  )
})

test('builds the verify email url with the provided address', () => {
  const previousWindow = globalThis.window

  globalThis.window = {
    location: {
      origin: 'https://visitflow-lovat.vercel.app',
    },
  } as typeof globalThis.window

  assert.equal(
    buildVerifyEmailUrl('bundyglenn@gmail.com'),
    'https://visitflow-lovat.vercel.app/verify-email?email=bundyglenn%40gmail.com'
  )

  if (previousWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window')
  } else {
    globalThis.window = previousWindow
  }
})

test('detects Supabase email delivery restrictions', () => {
  assert.equal(
    isEmailDeliveryBlockedError({
      status: 400,
      code: 'email_address_not_authorized',
      message: 'Email address not authorized',
    }),
    true
  )
})

test('explains the default SMTP delivery limit clearly', () => {
  assert.equal(
    getEmailDeliveryIssueMessage({
      status: 400,
      code: 'email_address_not_authorized',
      message: 'Email address not authorized',
    }),
    'Supabase can only send auth emails to members of your Supabase organization until you configure custom SMTP.'
  )
})
