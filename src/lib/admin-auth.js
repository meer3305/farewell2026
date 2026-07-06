export const ADMIN_COOKIE = 'admin_session'
const DEFAULT_ADMIN_PASSWORD = 'freshers2026'

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD
}

export async function createSessionToken(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(`freshers-admin:${password}`)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function getExpectedSessionToken() {
  return createSessionToken(getAdminPassword())
}

export async function isValidSessionToken(token) {
  if (!token) return false
  const expected = await getExpectedSessionToken()
  return token === expected
}
