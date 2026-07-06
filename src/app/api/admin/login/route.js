import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, getAdminPassword, getExpectedSessionToken } from '@/lib/admin-auth'

export async function POST(request) {
  const { password } = await request.json()

  if (password !== getAdminPassword()) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = await getExpectedSessionToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return response
}
