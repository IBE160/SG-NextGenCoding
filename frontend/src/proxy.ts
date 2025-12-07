import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const accessToken = request.cookies.get('access_token')?.value

  // Paths that are public and don't require authentication
  // Keep this list minimal — do NOT include protected pages like `/dashboard` or `/notes`.
  const publicPaths = [
    '/login',
    '/register',
    '/',
    '/forgot-password',
    '/upload',
    '/summaries',
  ]

  // Let static assets, images, and API routes pass through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // for files like favicon.ico
  ) {
    return NextResponse.next()
  }

  // Check if pathname matches or starts with any public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + '/')
  )

  if (accessToken) {
    // If authenticated and trying to access specifically auth pages (login/register), redirect to dashboard
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  } else {
    // If not authenticated and trying to access a non-public path, redirect to login
    if (!isPublicPath) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirectedFrom', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Allow the request to proceed
  return NextResponse.next()
}

export const config = {
  // Match all paths except for static files and images
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
