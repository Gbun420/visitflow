import { prisma } from './prisma'

const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST?.replace(/\/$/, '')
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET

export const KEYCLOAK_ISSUER = KEYCLOAK_HOST && KEYCLOAK_REALM ? `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}` : undefined
const TOKEN_ENDPOINT = KEYCLOAK_ISSUER
  ? `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`
  : undefined

export interface KeycloakClaims {
  sub?: string
  email?: string
  name?: string
  preferred_username?: string
  realm?: string
  tenantId?: string
  companyId?: string
}

export function decodeKeycloakToken<T>(token?: string) {
  if (!token) return undefined
  const payload = token.split('.')[1]
  if (!payload) return undefined

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  return JSON.parse(Buffer.from(normalized, 'base64').toString()) as T
}

export function extractTenantIdentifier(claims: KeycloakClaims | undefined) {
  if (!claims) return undefined
  return claims.companyId ?? claims.tenantId ?? claims.realm
}

export async function findCompanyForTenant(identifier?: string) {
  if (!identifier) return null

  return prisma.company.findFirst({
    where: {
      AND: [
        {
          OR: [
            { externalId: identifier },
            { name: { equals: identifier, mode: 'insensitive' } },
            { id: identifier },
          ],
        },
        { status: 'ACTIVE' },
      ],
    },
  })
}

export async function requestKeycloakToken(email: string, password: string) {
  if (!TOKEN_ENDPOINT) {
    throw new Error('Keycloak is not configured (missing KEYCLOAK_HOST/REALM)')
  }

  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: KEYCLOAK_CLIENT_ID ?? '',
    client_secret: KEYCLOAK_CLIENT_SECRET ?? '',
    username: email,
    password,
  })

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error((error as any)?.error_description ?? 'Invalid credentials')
  }

  return response.json() as Promise<{
    access_token: string
    id_token: string
    refresh_token: string
    expires_in: number
    token_type: string
  }>
}
