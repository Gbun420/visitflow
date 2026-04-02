import NextAuth from 'next-auth'
import { DefaultUser, DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      companyId?: string | null
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    companyId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    companyId?: string | null
  }
}
