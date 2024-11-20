import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authMiddleware } from './middleware/core/auth';
import { rateLimitMiddleware } from './middleware/security/rateLimit';
import logger from '@/lib/logger';

export async function middleware(request: NextRequest) {
  try {
    // Apply rate limiting first
    const rateLimitResponse = await rateLimitMiddleware({
      windowMs: 60 * 1000, // 1 minute
      max: 100 // 100 requests per minute
    })(request);

    if (rateLimitResponse.status === 429) {
      return rateLimitResponse;
    }

    // Then apply auth middleware
    const authResponse = await authMiddleware(request, {
      requireAuth: true,
      requireVerified: true,
      require2FA: false
    });

    return authResponse;
  } catch (error) {
    logger.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/error', request.url));
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
