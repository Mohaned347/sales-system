import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup')
  const isApiRoute = pathname.startsWith('/api')
  const isPublicPath = pathname === '/' || pathname === '/pricing' || pathname.startsWith('/_next')
  
  // Allow API routes and static files
  if (isApiRoute || pathname.includes('.')) {
    return NextResponse.next()
  }

  // Redirect to dashboard if user is logged in and tries to access auth pages
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Redirect to login if user is not logged in and tries to access protected routes
  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For public paths, just continue
  if (isPublicPath) {
    return NextResponse.next()
  }

  // For all other cases, continue with the request
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}