import test from 'node:test'
import assert from 'node:assert/strict'
import { getAuthenticatedLandingPath } from '../lib/navigation.ts'

test('routes signed out users to login', () => {
  assert.equal(getAuthenticatedLandingPath(null), '/login')
})

test('routes authenticated users without a company to setup', () => {
  assert.equal(getAuthenticatedLandingPath({ company: null }), '/setup/company')
})

test('routes authenticated users with a company to dashboard', () => {
  assert.equal(
    getAuthenticatedLandingPath({ company: { id: 'company_123' } }),
    '/dashboard'
  )
})
