import { adminAuth } from '@/lib/firebase-admin'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json()
    if (!idToken) {
      return NextResponse.json({ error: 'No idToken' }, { status: 400 })
    }

    // Phase 1.2: Verify idToken
    await adminAuth.verifyIdToken(idToken)

    const expiresIn = 60 * 60 * 24 * 5 * 1000 // 5 days

    // Phase 1.3: Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn })

    // Phase 1.4: Set __session cookie
    cookies().set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json({ status: 'success' })
  } catch (error: any) {
    console.error('Session API Error DETAILS:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      idTokenProvided: !!request.body
    })
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    }, { status: 500 })
  }
}

export async function DELETE() {
  // Phase 1.5: Clear __session cookie
  cookies().delete('__session')
  return NextResponse.json({ status: 'success' })
}
