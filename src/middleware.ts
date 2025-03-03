import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from '@/lib/auth/middleware';
import { logger } from '@/lib/utils/clientLogger';

/**
 * Main middleware entry point
 * @param request The incoming request
 * @returns The response from the middleware chain
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    // Apply auth middleware
    return await authMiddleware(request);
  } catch (error) {
    // Catch any unexpected errors
    logger.error('Middleware error:', error);
    
    // For API routes, return JSON error
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    // For web routes, redirect to error page
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except for static files, api/auth, and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
