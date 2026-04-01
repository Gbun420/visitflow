import { adminAuth } from './firebase-admin'
import { prisma } from './prisma'
import { cookies } from 'next/headers'

/**
 * PHASE 4: Core helper for Server Components
 * Reads __session cookie, decodes it, and returns the Prisma User with Company.
 */
export async function getCurrentUser() {
  const sessionCookie = cookies().get('__session')?.value
  
  if (!sessionCookie) {
    return null
  }

  try {
    // 1. Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true)
    
    if (!decodedToken || !decodedToken.uid) {
      return null
    }

    // 2. Extract UID and find Prisma User
    // Note: We use firebaseUid which we added to the schema
    const user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: { 
        companies: {
          take: 1, // Get the primary company
          where: { status: 'ACTIVE' }
        }
      }
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

/**
 * Compatibility helper for existing API routes
 */
export async function getCompanyIdFromUser(): Promise<string | null> {
  const user = await getCurrentUser()
  return user?.company?.id || null
}

/**
 * Compatibility helper for full company object
 */
export async function getCompanyFromAuth(): Promise<{ companyId: string; company: any } | null> {
  const user = await getCurrentUser()
  if (!user || !user.company) return null
  return { companyId: user.company.id, company: user.company }
}
