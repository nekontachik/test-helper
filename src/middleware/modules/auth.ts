import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { securityLogger } from '@/lib/utils/securityLogger';
import { AUTH_ROUTES } from '@/constants/auth';
import type { UserRole } from '@/types/auth/roles';
import type { AccessTokenPayload } from '@/types/auth/tokens';
import { createErrorResponse, ErrorType } from '@/lib/utils/errorResponse';
import { isValidUserRole } from '@/lib/utils/typeGuards';

/**
 * Authentication middleware module
 */
export class AuthMiddleware {
  /**
   * Check if a path is public (doesn't require authentication)
   */
  public static isPublicPath(pathname: string): boolean {
    return AUTH_ROUTES.PUBLIC.some(
      (path: string) => new RegExp(`^${path}$`).test(pathname)
    );
  }

  /**
   * Get required roles for a path if any
   */
  public static getRequiredRolesForPath(pathname: string): UserRole[] | undefined {
    const match = Object.entries(AUTH_ROUTES.PROTECTED).find(([pattern]) => 
      new RegExp(`^${pattern}$`).test(pathname)
    );
    return match?.[1];
  }

  /**
   * Validate user authentication
   */
  public static async validateAuthentication(
    request: NextRequest,
    pathname: string
  ): Promise<{ token: AccessTokenPayload | null; response?: Response }> {
    // Skip auth check for public paths
    if (this.isPublicPath(pathname)) {
      return { token: null };
    }

    // Get token from request
    const token = await getToken({ req: request }) as AccessTokenPayload | null;

    // Check if authenticated
    if (!token?.sub) {
      securityLogger.warn('Unauthorized access attempt', {
        path: pathname,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      // Redirect to login for web pages, return 401 for API
      if (pathname.startsWith('/api/')) {
        return { 
          token: null,
          response: createErrorResponse({
            status: 401,
            type: ErrorType.AUTHENTICATION,
            message: 'Unauthorized'
          })
        };
      } else {
        return { 
          token: null,
          response: NextResponse.redirect(
            new URL(AUTH_ROUTES.REDIRECTS.UNAUTHORIZED, request.url)
          )
        };
      }
    }

    return { token };
  }

  /**
   * Validate user authorization (role-based)
   */
  public static validateAuthorization(
    token: AccessTokenPayload,
    pathname: string,
    request: NextRequest
  ): Response | undefined {
    // Check role requirements
    const requiredRoles = this.getRequiredRolesForPath(pathname);
    if (!requiredRoles || requiredRoles.length === 0) {
      return undefined;
    }

    if (!token.role || !isValidUserRole(token.role)) {
      securityLogger.warn('Invalid role access attempt', {
        userId: token.sub,
        role: token.role,
        path: pathname,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      if (pathname.startsWith('/api/')) {
        return createErrorResponse({
          status: 403,
          type: ErrorType.AUTHORIZATION,
          message: 'Invalid user role'
        });
      } else {
        return NextResponse.redirect(
          new URL(AUTH_ROUTES.REDIRECTS.FORBIDDEN, request.url)
        );
      }
    }

    const hasRequiredRole = requiredRoles.includes(token.role);
    if (!hasRequiredRole) {
      securityLogger.warn('Insufficient permissions', {
        userId: token.sub,
        role: token.role,
        requiredRoles,
        path: pathname,
        ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      if (pathname.startsWith('/api/')) {
        return createErrorResponse({
          status: 403,
          type: ErrorType.AUTHORIZATION,
          message: 'Insufficient permissions'
        });
      } else {
        return NextResponse.redirect(
          new URL(AUTH_ROUTES.REDIRECTS.FORBIDDEN, request.url)
        );
      }
    }

    return undefined;
  }
} 