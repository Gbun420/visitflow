import { createClient } from '@supabase/supabase-js'
import { prisma } from './prisma'
import { NextRequest } from 'next/server'

export async function getCompanyFromAuth(req: NextRequest): Promise<{ companyId: string; company: any } | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: { headers: { cookie: req.headers.get('cookie') ?? '' } },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const appUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!appUser || appUser.companies.length === 0) return null

  const company = appUser.companies[0]

  // Enforce active subscription
  if (company.status !== 'ACTIVE') {
    return null
  }

  return { companyId: company.id, company }
}

