import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getAuthenticatedLandingPath } from '@/lib/navigation'

export default async function HomePage() {
  const user = await getCurrentUser()
  redirect(getAuthenticatedLandingPath(user))
}
