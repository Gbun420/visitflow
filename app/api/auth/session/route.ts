import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/limiter'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  console.log('=== AUTH DEBUG (POST) ===')
  const ip = request.headers.get('x-forwarded-for') || 'anonymous'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  try {
    const limitResult = await rateLimit(`login_${ip}`, 5, 15 * 60 * 1000)

    if (!limitResult.success) {
      console.log('Rate limit exceeded for IP:', ip)
      return NextResponse.json({ error: 'Too many login attempts. Please try again in 15 minutes.' }, { status: 429 })
    }

    const { idToken } = await request.json()
    console.log('idToken received:', idToken ? 'Yes' : 'No')
    
    if (!idToken) {
      console.log('No idToken in request body')
      return NextResponse.json({ error: 'No idToken' }, { status: 400 })
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken)
    console.log('idToken verified for UID:', decodedToken.uid)
    
    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    cookies().set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: request.nextUrl.protocol === 'https:',
      path: '/',
      sameSite: 'lax',
    })
    console.log('__session cookie set successfully')

    // Log success
    const user = await prisma.user.findUnique({ 
      where: { firebaseUid: decodedToken.uid },
      include: { companies: true }
    })
    
    if (user) {
      await prisma.auditEvent.create({
        data: {
          companyId: user.companies[0]?.id || 'N/A',
          userId: user.id,
          action: 'auth_login_success',
          ip,
          userAgent,
        }
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error: any) {
    console.error('🔴 /api/auth/session (POST) error:', error.message)
    
    // Log failure attempt
    await prisma.auditEvent.create({
      data: {
        companyId: 'SYSTEM',
        action: 'auth_login_failure',
        metadata: { error: error.message },
        ip,
        userAgent,
      }
    })

    return NextResponse.json({ 
      error: 'Authentication failed', 
      details: error.message
    }, { status: 401 })
  }
}

export async function GET() {
  console.log('=== AUTH DEBUG (GET) ===')
  try {
    const sessionCookie = cookies().get('__session')?.value
    console.log('Session cookie received:', sessionCookie ? 'Yes' : 'No')
    
    if (!sessionCookie) {
      console.log('No session cookie found')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true)
    console.log('Session verified for user:', decodedClaims.uid)
    
    return NextResponse.json({ 
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        email_verified: decodedClaims.email_verified
      }
    })
  } catch (error: any) {
    console.error('Session verification failed:', error.message)
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}

export async function DELETE() {
  // Phase 1.5: Clear __session cookie
  cookies().delete('__session')
  return NextResponse.json({ status: 'success' })
}
