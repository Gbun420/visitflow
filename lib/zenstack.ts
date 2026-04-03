import { prisma } from './prisma'
import { enhance } from '@zenstackhq/runtime'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth-nextauth'

/**
 * Returns a ZenStack enhanced Prisma client for the current user session.
 */
export async function getEnhancedPrisma() {
  const session = await getServerSession(authOptions)
  
  return enhance(prisma, {
    user: session?.user ? { 
      id: (session.user as any).id, 
      companyId: (session.user as any).companyId 
    } : undefined
  })
}
