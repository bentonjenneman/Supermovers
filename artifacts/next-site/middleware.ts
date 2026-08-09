import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow the login endpoint through
  if (pathname === '/api/admin/login') {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('admin_session')?.value
  const adminSessionSecret = process.env.ADMIN_SESSION_SECRET

  const isAuthenticated =
    adminSessionSecret !== undefined && sessionCookie === adminSessionSecret

  if (isAuthenticated) {
    return NextResponse.next()
  }

  // Unauthenticated — differentiate between page and API requests
  if (pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Redirect /admin/* page requests to the login page
  const loginUrl = new URL('/admin', request.url)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  // /admin/:path+ (one or more segments) protects sub-routes but not /admin
  // itself, preventing a redirect loop on the login page.
  matcher: ['/admin/:path+', '/api/admin/:path*'],
}
