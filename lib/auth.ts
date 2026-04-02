import { createClient } from './supabase/server'
import { prisma } from './prisma'
import type { Prisma } from '@prisma/client'

/**
 * PHASE 4.X: Core helper for Server Components powered by Supabase
 * Returns the Prisma User with Company if a valid Supabase session exists.
 */
export async function getCurrentUser() {
  const supabase = createClient()
  
  try {
    const userInclude = {
      companies: {
        take: 1,
        where: { status: 'ACTIVE' as const },
        orderBy: { createdAt: 'asc' as const },
      },
    }

    // 1. Get user from Supabase
    const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser()
    
    if (sbError || !sbUser) {
      return null
    }

    const user = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 2. Find matching Prisma User.
      let currentUser = await tx.user.findUnique({
        where: { supabaseUid: sbUser.id },
        include: userInclude,
      })

      // 3. If this is a migrated account, re-key the legacy record by email.
      if (!currentUser && sbUser.email) {
        const legacyUser = await tx.user.findUnique({
          where: { email: sbUser.email },
          include: userInclude,
        })

        if (legacyUser) {
          currentUser = await tx.user.update({
            where: { id: legacyUser.id },
            data: {
              supabaseUid: sbUser.id,
              name: legacyUser.name ?? sbUser.user_metadata?.full_name ?? null,
              avatarUrl: legacyUser.avatarUrl ?? sbUser.user_metadata?.avatar_url ?? null,
            },
            include: userInclude,
          })
        }
      }

      // 4. Fallback: If user exists in Supabase but not in Prisma, create placeholder.
      if (!currentUser) {
        if (!sbUser.email) {
          return null
        }

        try {
          currentUser = await tx.user.create({
            data: {
              email: sbUser.email,
              name: sbUser.user_metadata?.full_name || null,
              supabaseUid: sbUser.id,
              avatarUrl: sbUser.user_metadata?.avatar_url || null,
            },
            include: userInclude,
          })
        } catch (createError: any) {
          if (!isUniqueConstraintError(createError)) {
            throw createError
          }

          currentUser =
            (await tx.user.findUnique({
              where: { supabaseUid: sbUser.id },
              include: userInclude,
            })) ||
            (sbUser.email
              ? await tx.user.findUnique({
                  where: { email: sbUser.email },
                  include: userInclude,
                })
              : null)

          if (!currentUser) {
            throw createError
          }
        }
      }

      return currentUser
    })

    if (!user) {
      return null
    }

    return {
      ...user,
      company: user.companies[0] || null
    }
  } catch (error) {
    console.error('getCurrentUser Error:', error)
    return null
  }
}

export async function getCompanyIdFromUser(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.company?.id || null
}

export async function getCompanyFromAuth(): Promise<{ companyId: string; company: any } | null> {
  const user = await getCurrentUser()
  if (!user || !user.company) return null
  return { companyId: user.company.id, company: user.company }
}

function isUniqueConstraintError(error: unknown) {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002'
}
