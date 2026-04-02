import { createClient } from './supabase/server'
import { prisma } from './prisma'

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
      },
    }

    // 1. Get user from Supabase
    const { data: { user: sbUser }, error: sbError } = await supabase.auth.getUser()
    
    if (sbError || !sbUser) {
      return null
    }

    // 2. Find matching Prisma User
    let user = await prisma.user.findUnique({
      where: { supabaseUid: sbUser.id },
      include: userInclude
    })

    // 3. If this is a migrated account, re-key the legacy record by email.
    if (!user && sbUser.email) {
      const legacyUser = await prisma.user.findUnique({
        where: { email: sbUser.email },
        include: userInclude,
      })

      if (legacyUser) {
        user = await prisma.user.update({
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
    if (!user) {
      if (!sbUser.email) {
        return null
      }

      const newUser = await prisma.user.create({
        data: {
          email: sbUser.email,
          name: sbUser.user_metadata?.full_name || null,
          supabaseUid: sbUser.id,
          avatarUrl: sbUser.user_metadata?.avatar_url || null,
        },
        include: { companies: true }
      })
      return {
        ...newUser,
        company: null
      }
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

export async function requireMfa(): Promise<boolean> {
  // Add Supabase MFA logic here if needed
  return true 
}
