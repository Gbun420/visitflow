import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import {
  findCompanyForTenant,
  extractTenantIdentifier,
  requestKeycloakToken,
  decodeKeycloakToken,
  KeycloakClaims,
} from './auth-keycloak'
import KeycloakProvider from 'next-auth/providers/keycloak'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'
import bcrypt from 'bcryptjs'

const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST?.replace(/\/$/, '')
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET
const KEYCLOAK_ISSUER =
  KEYCLOAK_HOST && KEYCLOAK_REALM ? `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}` : undefined

const buildKeycloakProfile = (profile: any) => {
  const tenantId = extractTenantIdentifier({
    companyId: profile.companyId,
    tenantId: profile.tenantId,
    realm: profile.realm,
  })

  return {
    id: profile.sub,
    name: profile.name ?? profile.preferred_username ?? profile.email,
    email: profile.email,
    image: profile.picture,
    tenantId,
  }
}

async function ensureUser(email: string, name?: string, sub?: string, tenantId?: string) {
  const supabaseUid = sub ? `keycloak:${sub}` : null

  const existing = await prisma.user.findUnique({
    where: { email },
    include: { companies: true },
  })

  if (existing) {
    if (sub && !existing.supabaseUid) {
      await prisma.user.update({
        where: { id: existing.id },
        data: { supabaseUid },
      })
    }
    return existing
  }

  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      supabaseUid,
    },
    include: { companies: true },
  })

  if (tenantId) {
    const company = await findCompanyForTenant(tenantId)
    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { userId: user.id },
      })
    }
  }

  return user
}

async function resolveCompanyId(userId: string, tenantId?: string) {
  if (tenantId) {
    const company = await findCompanyForTenant(tenantId)
    if (company) return company.id
  }

  const linking = await prisma.company.findFirst({
    where: { userId, status: 'ACTIVE' },
  })
  return linking?.id ?? null
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    KeycloakProvider({
      clientId: KEYCLOAK_CLIENT_ID ?? '',
      clientSecret: KEYCLOAK_CLIENT_SECRET ?? '',
      issuer: KEYCLOAK_ISSUER,
      profile(profile) {
        return buildKeycloakProfile(profile)
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Email and password are required')
        }

        // 1. Try Keycloak first if configured
        if (KEYCLOAK_ISSUER) {
          try {
            const tokenResponse = await requestKeycloakToken(
              credentials.email,
              credentials.password
            )
            const claims = decodeKeycloakToken<KeycloakClaims>(tokenResponse.access_token)

            if (claims?.email) {
              const user = await ensureUser(
                claims.email,
                claims.name ?? claims.preferred_username,
                claims.sub,
                extractTenantIdentifier(claims)
              )

              const companyId = await resolveCompanyId(user.id, extractTenantIdentifier(claims))

              return {
                id: user.id,
                email: user.email,
                name: user.name ?? null,
                companyId,
              }
            }
          } catch (keycloakError) {
            console.warn('Keycloak auth failed, falling back to local DB:', keycloakError)
          }
        }

        // 2. Fallback to local DB
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid email or password')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)

        if (!isValid) {
          throw new Error('Invalid email or password')
        }

        const companyId = await resolveCompanyId(user.id)

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? null,
          companyId,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      
      // Always fetch latest companyId from DB to ensure it's up to date
      // (e.g. after user finishes company setup)
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { companyId: true }
      })
      
      token.companyId = dbUser?.companyId ?? null
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.companyId = token.companyId as string | null
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
