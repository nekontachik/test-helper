import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { MIDDLEWARE_CONFIG } from './config';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { SecurityService } from '@/lib/security/securityService';
import { AuditService } from '@/lib/audit/auditService';
import { UserRole } from '@/types/rbac';
import { AuditAction, AuditLogType } from '@/types/audit';
import type { JWT } from 'next-auth/jwt';
import { logger } from '@/lib/utils/logger';

/**
 * Main request handler middleware
 * 
 * Handles authentication, authorization, rate limiting, and request auditing.
 */

interface AuthToken extends JWT {
  sub: string;
  role: string;
}

interface RequestMetadata {
  path: string;
  method: string;
  ip?: string;
  userAgent?: string;
}

class RequestHandler {
  private static isValidUserRole(role: string): role is UserRole {
    return Object.values(UserRole).includes(role as UserRole);
  }

  private static isPublicPath(pathname: string): boolean {
    return MIDDLEWARE_CONFIG.auth.publicPaths.some(
      path => new RegExp(`^${path}$`).test(pathname)
    );
  }

  private static isStaticFile(pathname: string): boolean {
    return Boolean(pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/));
  }

  private static getRequiredRoles(pathname: string): UserRole[] | undefined {
    const match = Object.entries(MIDDLEWARE_CONFIG.roleAccess).find(
      ([pattern]) => new RegExp(`^${pattern}$`).test(pathname)
    );
    return match?.[1];
  }

  private static async logRequest(token: AuthToken, metadata: RequestMetadata): Promise<void> {
    await AuditService.log({
      userId: token.sub,
      type: AuditLogType.SYSTEM,
      action: AuditAction.API_REQUEST,
      metadata: {
        path: metadata.path,
        method: metadata.method,
        ip: metadata.ip,
        userAgent: metadata.userAgent,
      }
    });
  }

  static async handleRequest(request: Request): Promise<Response> {
    try {
      const { pathname } = new URL(request.url);

      // Skip middleware for static files
      if (this.isStaticFile(pathname)) {
        return NextResponse.next();
      }

      // Initialize response with security headers
      const response = NextResponse.next();
      const headers = SecurityService.getSecurityHeaders();
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Check if path is public
      if (this.isPublicPath(pathname)) {
        return response;
      }

      // Get and validate user token
      const token = await getToken({ req: request as any }) as AuthToken | null;
      if (!token?.sub) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
      }

      // Validate user role
      if (!token.role || !this.isValidUserRole(token.role)) {
        logger.warn('Invalid user role', { userId: token.sub, role: token.role });
        return NextResponse.json(
          { error: 'Invalid user role' },
          { status: 403 }
        );
      }

      // Check role-based access
      const requiredRoles = this.getRequiredRoles(pathname);
      if (requiredRoles && !requiredRoles.includes(token.role as UserRole)) {
        logger.warn('Unauthorized access attempt', {
          userId: token.sub,
          role: token.role,
          path: pathname,
        });
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // Apply rate limiting for API routes
      if (pathname.startsWith('/api/')) {
        const rateLimiter = new RateLimiter();
        const ip = request.headers.get('x-forwarded-for') || 'anonymous';
        
        try {
          const config = pathname.startsWith('/api/admin')
            ? MIDDLEWARE_CONFIG.rateLimit.admin
            : pathname.startsWith('/api/auth')
            ? MIDDLEWARE_CONFIG.rateLimit.auth
            : MIDDLEWARE_CONFIG.rateLimit.api;

          await rateLimiter.checkLimit(ip, config);
        } catch (error) {
          logger.warn('Rate limit exceeded', { ip, path: pathname });
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429 }
          );
        }
      }

      // Log request
      await this.logRequest(token, {
        path: pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || undefined,
        userAgent: request.headers.get('user-agent') || undefined,
      });

      return response;
    } catch (error) {
      logger.error('Middleware error', { error });
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}

/**
 * Middleware handler function
 */
export async function middlewareHandler(request: Request): Promise<Response> {
  return RequestHandler.handleRequest(request);
}

/**
 * Usage Examples:
 * 
 * ```typescript
 * // middleware.ts
 * export default middlewareHandler;
 * ```
 * 
 * ```typescript
 * // middleware.ts with custom config
 * export default function middleware(request: Request) {
 *   // Custom logic here
 *   return middlewareHandler(request);
 * }
 * ```
 */

/**
 * Security Features:
 * - Authentication validation
 * - Role-based access control
 * - Rate limiting
 * - Security headers
 * - Request auditing
 * 
 * Performance Considerations:
 * - Static file bypass
 * - Efficient regex patterns
 * - Proper error handling
 * - Logging optimization
 * 
 * Dependencies:
 * - next-auth/jwt
 * - @/lib/rate-limit/RateLimiter
 * - @/lib/security/securityService
 * - @/lib/audit/auditService
 */ 