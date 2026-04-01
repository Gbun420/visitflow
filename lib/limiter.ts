// Simple in-memory rate limiter
// Note: In serverless environments (Vercel), this only works per-instance.
// For production, use Upstash Redis as suggested in the audit.

const rateLimits = new Map<string, { count: number; lastReset: number }>()

export async function rateLimit(key: string, limit: number = 5, windowMs: number = 15 * 60 * 1000) {
  const now = Date.now()
  const entry = rateLimits.get(key) || { count: 0, lastReset: now }

  if (now - entry.lastReset > windowMs) {
    entry.count = 0
    entry.lastReset = now
  }

  entry.count++
  rateLimits.set(key, entry)

  if (entry.count > limit) {
    return { success: false, limit, remaining: 0 }
  }

  return { success: true, limit, remaining: limit - entry.count }
}
