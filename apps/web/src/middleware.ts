import { NextResponse, type NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/api/protected'
]

// Routes that should redirect authenticated users away (auth pages)
const authRoutes = [
  '/login',
  '/signup',
  '/forgot-password'
]

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/verify-email'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith('/api/public')
  )

  // Get the session token from cookies
  const sessionToken = request.cookies.get('__session')?.value
  
  // Check for Firebase Auth token in cookies (Firebase sets this automatically)
  const firebaseToken = request.cookies.get('__session')?.value || 
                       request.cookies.get('firebase-auth-token')?.value ||
                       request.headers.get('authorization')?.replace('Bearer ', '')

  // For API routes, check Authorization header
  if (pathname.startsWith('/api/protected')) {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    // Here you could validate the Firebase token with Firebase Admin SDK
    // For now, we'll just check if the token exists
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Continue to the API route
    return NextResponse.next()
  }

  // Handle protected routes
  if (isProtectedRoute) {
    // If no session token, redirect to login
    if (!sessionToken && !firebaseToken) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('from', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Optional: Validate token with Firebase Admin SDK here
    // For production, you should verify the token server-side
    
    // Allow access to protected route
    return NextResponse.next()
  }

  // Handle auth routes (login, signup, etc.)
  if (isAuthRoute) {
    // If user is already authenticated, redirect to dashboard
    if (sessionToken || firebaseToken) {
      const fromParam = request.nextUrl.searchParams.get('from')
      const redirectUrl = fromParam || '/dashboard'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }

    // Allow access to auth routes for unauthenticated users
    return NextResponse.next()
  }

  // Allow access to public routes
  if (isPublicRoute || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // For any other routes, continue normally
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/public (public API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api/public|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}