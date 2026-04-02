import test from 'node:test'
import assert from 'node:assert/strict'
import { getPublicAppUrl, getServerAppUrl } from '../lib/public-url.ts'

test('browser origin wins over a stale NEXT_PUBLIC_APP_URL value', () => {
  const previousWindow = globalThis.window
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL

  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  globalThis.window = {
    location: {
      origin: 'https://visitflow-lovat.vercel.app',
    },
  } as typeof globalThis.window

  assert.equal(getPublicAppUrl(), 'https://visitflow-lovat.vercel.app')

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
})

test('server origin falls back to the production Vercel hostname', () => {
  const previousWindow = globalThis.window
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const previousVercelUrl = process.env.VERCEL_URL

  Reflect.deleteProperty(globalThis, 'window')
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'visitflow-lovat.vercel.app'
  Reflect.deleteProperty(process.env, 'VERCEL_URL')

  assert.equal(getServerAppUrl(), 'https://visitflow-lovat.vercel.app')

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
})

test('server origin prefers the Vercel production hostname over NEXT_PUBLIC_APP_URL', () => {
  const previousWindow = globalThis.window
  const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL
  const previousProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const previousVercelUrl = process.env.VERCEL_URL

  Reflect.deleteProperty(globalThis, 'window')
  process.env.NEXT_PUBLIC_APP_URL = 'https://visitflow.com'
  process.env.VERCEL_PROJECT_PRODUCTION_URL = 'visitflow-lovat.vercel.app'
  Reflect.deleteProperty(process.env, 'VERCEL_URL')

  assert.equal(getServerAppUrl(), 'https://visitflow-lovat.vercel.app')

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
})
