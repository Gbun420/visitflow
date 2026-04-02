import { type NextRequest } from 'next/server'
import { completeAuthRedirect } from '@/lib/auth/redirect'

export async function GET(request: NextRequest) {
  return completeAuthRedirect(request)
}
