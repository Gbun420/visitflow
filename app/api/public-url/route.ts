import { NextResponse } from 'next/server'
import { resolvePublicUrl } from '@/lib/url-resolver'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json({
    url: resolvePublicUrl(),
  })
}
