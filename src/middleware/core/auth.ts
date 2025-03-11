import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import type { UserRole } from '@/types/auth';
import { logger } from '@/lib/logger';

interface AuthOptions {
  requireAuth?: boolean;
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: UserRole[];
}

export async function authMiddleware(
  request: NextRequest,
  options: AuthOptions = {}
): Promise<NextResponse> {
  try {
    // Skip auth check for public routes
    if (isPublicRoute(request.nextUrl.pathname)) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request });

    // Handle unauthenticated requests
    if (!token) {
      if (options.requireAuth) {
        return redirectToLogin(request);
      }
      return NextResponse.next();
    }

    // Check email verification
    if (options.requireVerified && !token.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verify-email', request.url));
    }

    // Check 2FA
    if (options.require2FA && !token.twoFactorAuthenticated) {
      return NextResponse.redirect(new URL('/auth/2fa', request.url));
    }

    // Check role permissions
    if (options.allowedRoles?.length) {
      const hasRole = options.allowedRoles.includes(token.role as UserRole);
      if (!hasRole) {
        logger.warn('Unauthorized role access attempt', {
          path: request.nextUrl.pathname,
          role: token.role,
          requiredRoles: options.allowedRoles
        });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}

// Helper functions
function isPublicRoute(path: string): boolean {
  const publicPaths = [
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/forgot-password',
    '/api/auth'
  ];
  return publicPaths.some(publicPath => path.startsWith(publicPath));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth/signin', request.url);
  loginUrl.searchParams.set('callbackUrl', request.url);
  return NextResponse.redirect(loginUrl);
} 