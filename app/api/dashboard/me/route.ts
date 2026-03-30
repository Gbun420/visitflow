import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

// GET /api/dashboard/me
// Returns user's company (first) for context
export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        cookie: req.headers.get('cookie') ?? '',
      },
    },
  })

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const appUser = await prisma.user.findUnique({ where: { email: user.email } })
  if (!appUser || appUser.companies.length === 0) {
    return NextResponse.json({ companyId: null, company: null })
  }

  const company = appUser.companies[0]
  return NextResponse.json({ companyId: company.id, company: { id: company.id, name: company.name } })
}
