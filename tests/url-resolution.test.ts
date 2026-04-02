import test from 'node:test'
import assert from 'node:assert/strict'
import { resolvePublicUrl } from '../lib/url-resolver.ts'
import { resolveSafeNextPath } from '../lib/url-resolver.ts'

test('server origin prefers the Vercel preview deployment url over NEXT_PUBLIC_APP_URL', () => {
  const previousWindow = globalThis.window
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const previousVercelUrl = process.env.VERCEL_URL
  const previousVercelEnv = process.env.VERCEL_ENV

  Reflect.deleteProperty(globalThis, 'window')
  process.env.VERCEL_ENV = 'preview'
  process.env.VERCEL_URL = 'visitflow-git-feature.vercel.app'
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'visitflow-lovat.vercel.app'
  process.env.NEXT_PUBLIC_APP_URL = 'https://stale.example.com'

  assert.equal(resolvePublicUrl(), 'https://visitflow-git-feature.vercel.app')

  if (previousWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window')
  } else {
    globalThis.window = previousWindow
  }

  if (previousAppUrl === undefined) {
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_APP_URL')
  } else {
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
  }

  if (previousProdUrl === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_PROJECT_PRODUCTION_URL')
  } else {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = previousProdUrl
  }

  if (previousVercelUrl === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_URL')
  } else {
    process.env.VERCEL_URL = previousVercelUrl
  }

  if (previousVercelEnv === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_ENV')
  } else {
    process.env.VERCEL_ENV = previousVercelEnv
  }
})

test('server origin ignores spoofed request headers and keeps the configured deployment origin', () => {
  const previousWindow = globalThis.window
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const previousVercelUrl = process.env.VERCEL_URL
  const previousVercelEnv = process.env.VERCEL_ENV

  Reflect.deleteProperty(globalThis, 'window')
  process.env.VERCEL_ENV = 'production'
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'visitflow-lovat.vercel.app'
  process.env.VERCEL_URL = 'visitflow-production-shadow.vercel.app'
  process.env.NEXT_PUBLIC_APP_URL = 'https://stale.example.com'

  const ignoredHeaders = new Headers({
    host: 'evil.example.com',
    'x-forwarded-host': 'evil.example.com',
    'x-vercel-deployment-url': 'evil.example.com',
  })

  assert.equal(resolvePublicUrl(), 'https://visitflow-lovat.vercel.app')
  void ignoredHeaders

  if (previousWindow === undefined) {
    Reflect.deleteProperty(globalThis, 'window')
  } else {
    globalThis.window = previousWindow
  }

  if (previousAppUrl === undefined) {
    Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_APP_URL')
  } else {
    process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
  }

  if (previousProdUrl === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_PROJECT_PRODUCTION_URL')
  } else {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = previousProdUrl
  }

  if (previousVercelUrl === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_URL')
  } else {
    process.env.VERCEL_URL = previousVercelUrl
  }

  if (previousVercelEnv === undefined) {
    Reflect.deleteProperty(process.env, 'VERCEL_ENV')
  } else {
    process.env.VERCEL_ENV = previousVercelEnv
  }
})

test('safe next path rejects absolute and protocol-relative urls', () => {
  assert.equal(resolveSafeNextPath('/reset-password', '/dashboard'), '/reset-password')
  assert.equal(resolveSafeNextPath('/reset-password?step=1', '/dashboard'), '/reset-password?step=1')
  assert.equal(resolveSafeNextPath('https://evil.com', '/dashboard'), '/dashboard')
  assert.equal(resolveSafeNextPath('//evil.com', '/dashboard'), '/dashboard')
})
