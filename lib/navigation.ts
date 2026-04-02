type AuthenticatedLandingUser = {
  company?: { id: string } | null
} | null

export function getAuthenticatedLandingPath(user: AuthenticatedLandingUser) {
  if (!user) {
    return '/login'
  }

  return user.company ? '/dashboard' : '/setup/company'
}
