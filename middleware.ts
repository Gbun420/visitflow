import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Phase 3.1: Extract __session cookie
  const session = request.cookies.get('__session')?.value
  const pathname = request.nextUrl.pathname

  // Protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard')
  
  // Auth routes
  const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/'

  // Logic Phase 3.2
  
  // 1. If protected route and no session -> redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If auth route and has session -> redirect to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Special case for root path without session -> redirect to login
  if (pathname === '/' && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Phase 3.3: Correct matcher
  matcher: ['/', '/dashboard/:path*', '/login', '/signup'],
}
