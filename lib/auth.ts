import { getServerSession } from 'next-auth/next'
import { prisma } from './prisma'
import { authOptions } from './auth-nextauth'

/**
 * Core helper for Server Components to get the current authenticated user.
 * Returns the Prisma User with Company if a valid session exists.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        company: true,
      },
    })

    if (!user) {
      return null
    }

    return user
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
