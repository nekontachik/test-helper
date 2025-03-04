import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/projects',
  '/admin',
];

// Define admin-only routes
const adminRoutes = [
  '/admin',
];

/**
 * Main middleware entry point
 * @param request The incoming request
 * @returns The response from the middleware chain
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the route is admin-only
  const isAdminRoute = adminRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Skip middleware for non-protected routes
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Get the token from the request
  const token = await getToken({
    req: request,
    // Use a fallback secret for development
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  });
  
  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // Check for admin access
  if (isAdminRoute && token.role !== 'ADMIN') {
    // Redirect to unauthorized page if not an admin
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }
  
  // Allow access to protected routes
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require auth
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/public).*)',
  ],
};
