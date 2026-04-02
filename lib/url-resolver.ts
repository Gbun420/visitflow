const SAFE_NEXT_BASE = 'https://visitflow.invalid'
const DEFAULT_PRODUCTION_URL = 'https://visitflow-lovat.vercel.app'
const DEFAULT_LOCALHOST_URL = 'http://localhost:3000'

function normalizeUrl(value: string | undefined) {
  return value?.trim().replace(/\/$/, '') ?? ''
}

function isLocalhostUrl(value: string) {
  try {
    const url = new URL(value)
    return (
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      url.hostname.endsWith('.localhost')
    )
  } catch {
    return value.includes('localhost') || value.includes('127.0.0.1')
  }
}

function toOrigin(candidate: string, protocol = 'https') {
  const value = normalizeUrl(candidate)
  if (!value) {
    return ''
  }

  try {
    return new URL(value).origin
  } catch {
    try {
      return new URL(`${protocol}://${value}`).origin
    } catch {
      return ''
    }
  }
}

function resolveEnvironmentUrl() {
  const vercelEnv = process.env.VERCEL_ENV
  const candidates =
    vercelEnv === 'preview'
      ? [
          normalizeUrl(process.env.VERCEL_URL),
          normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
          normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
          normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
        ]
      : vercelEnv === 'development'
        ? [
            normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
            normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
            normalizeUrl(process.env.VERCEL_URL),
            normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
          ]
        : [
            normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL),
            normalizeUrl(process.env.VERCEL_URL),
            normalizeUrl(process.env.NEXT_PUBLIC_APP_URL),
            normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL),
          ]

  for (const candidate of candidates) {
    if (!candidate) {
      continue
    }

    const origin = toOrigin(candidate)
    if (!origin) {
      continue
    }

    if (process.env.NODE_ENV !== 'development' && isLocalhostUrl(origin)) {
      continue
    }

    return origin
  }

  return process.env.NODE_ENV === 'development' || vercelEnv === 'development'
    ? DEFAULT_LOCALHOST_URL
    : DEFAULT_PRODUCTION_URL
}

export function resolvePublicUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }

  return resolveEnvironmentUrl()
}

export function resolveSafeNextPath(
  value: string | null | undefined,
  fallback: string
) {
  if (!value) {
    return fallback
  }

  const trimmed = value.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return fallback
  }

  try {
    const url = new URL(trimmed, SAFE_NEXT_BASE)
    if (url.origin !== SAFE_NEXT_BASE) {
      return fallback
    }

    return `${url.pathname}${url.search}${url.hash}` || fallback
  } catch {
    return fallback
  }
}
