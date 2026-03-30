import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/auth-helpers-nextjs'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

// POST /api/auth/signup
// Body: { email, password, name, companyName }
export async function POST(req: NextRequest) {
  try {
    const { email, password, name, companyName } = await req.json()
    if (!email || !password || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 1. Check if email already exists in Supabase
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { users } } = await supabase.auth.admin.listUsers()
    if (users.some((u: any) => u.email === email)) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // 2. Create auth user via Supabase (bypass admin because we have service role)
    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) throw authError

    // 3. Hash password for our DB (if storing separately)
    const passwordHash = await hash(password, 10)

    // 4. Create user record in our DB
    const user = await prisma.user.create({
      data: { email, name, avatarUrl: null },
    })

    // 5. Create company linked to user
    const company = await prisma.company.create({
      data: {
        name: companyName,
        registrationNumber: 'PENDING',
        taxId: 'PENDING',
        userId: user.id,
        subscriptionTier: 'FREE',
        status: 'ACTIVE',
      },
    })

    // 6. Create Stripe customer now (optional)
    // const stripeCustomer = await stripe.customers.create({ email, metadata: { companyId: company.id } })
    // await prisma.company.update({ where: { id: company.id }, data: { stripeCustomerId: stripeCustomer.id } })

    return NextResponse.json({ user: { id: user.id, email, name }, company: { id: company.id, name: company.name } })
  } catch (error: any) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
