import { resolvePublicUrl } from './url-resolver.ts'

export function getServerAppUrl() {
  return resolvePublicUrl()
}

export function getPublicAppUrl() {
  return resolvePublicUrl()
}
