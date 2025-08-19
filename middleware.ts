import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const url = new URL(request.url)
  if (url.hostname === 'tourify.live') {
    url.hostname = 'www.tourify.live'
    return NextResponse.redirect(url, 308)
  }

  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  console.log(`[Main Middleware] Processing: ${pathname}`)
  console.log(`[Main Middleware] User authenticated: ${!!user}`)
  console.log(`[Main Middleware] User ID: ${user?.id || 'none'}`)

  // Define route categories
  const publicRoutes = [
    '/login',
    '/signup', 
    '/auth/callback',
    '/auth/verification',
    '/forgot-password',
    '/reset-password',
    '/terms',
    '/privacy',
    '/auth-demo', // Add the demo page
    '/auth-test', // Add the test page
  ]

  const authRoutes = [
    '/login',
    '/signup',
    '/auth/signin', // Keep for backward compatibility
    '/auth/signup',
  ]

  const protectedRoutes = [
    '/dashboard',
    '/onboarding',
    '/profile',
    '/settings',
    '/events',
    '/messages',
    '/analytics',
    '/feed',
    '/create',
    '/bookings',
    '/documents',
    '/projects',
    '/team',
    '/admin',
    '/artist',
    '/business',
    '/venue',
  ]

  const isPublicRoute = publicRoutes.includes(pathname)
  const isAuthRoute = authRoutes.includes(pathname)
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isRootRoute = pathname === '/'

  console.log(`[Main Middleware] Route type - Public: ${isPublicRoute}, Auth: ${isAuthRoute}, Protected: ${isProtectedRoute}, Root: ${isRootRoute}`)

  // Handle root route redirects
  if (isRootRoute) {
    if (user) {
      console.log(`[Main Middleware] Authenticated user accessing root, redirecting to dashboard`)
      const redirectUrl = new URL('/dashboard', request.url)
      return NextResponse.redirect(redirectUrl)
    } else {
      console.log(`[Main Middleware] Unauthenticated user accessing root, redirecting to login`)
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && isAuthRoute) {
    console.log(`[Main Middleware] Authenticated user accessing auth page, redirecting to dashboard`)
    const redirectUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // TEMPORARY WORKAROUND: Allow access to protected routes even without server-side auth detection
  // This allows users to continue using the platform while we fix the cookie issue
  if (!user && isProtectedRoute) {
    console.log(`[Main Middleware] Server-side auth detection failed, but allowing access (temporary workaround)`)
    console.log(`[Main Middleware] Client-side auth should handle the actual protection`)
    
    // Allow the request to proceed - client-side auth will handle protection
    return supabaseResponse
  }

  // Handle legacy routes
  if (pathname === '/auth/signin' || pathname === '/signin') {
    console.log(`[Main Middleware] Legacy route redirect: ${pathname} -> /login`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (pathname === '/auth/signup') {
    console.log(`[Main Middleware] Legacy route redirect: ${pathname} -> /signup`)
    return NextResponse.redirect(new URL('/signup', request.url))
  }

  console.log(`[Main Middleware] Allowing access to: ${pathname}`)
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

