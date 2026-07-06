import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, isValidSessionToken } from '@/lib/admin-auth'

export async function middleware(request) {
  const token = request.cookies.get(ADMIN_COOKIE)?.value
  const authorized = await isValidSessionToken(token)

  if (!authorized) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/dashboard',
    '/admin/dashboard/:path*',
    '/admin/scan',
    '/admin/scan/:path*',
    '/api/send-email',
    '/api/mark-attendance',
  ],
}
