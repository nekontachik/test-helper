import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/lib/logger';
import { createErrorResponse, ErrorType } from '@/lib/utils/errorResponse';
import { 
  AuthMiddleware, 
  RateLimitMiddleware, 
  SecurityMiddleware, 
  AuditMiddleware
} from './modules';

/**
 * Middleware handler for all requests
 */
export class MiddlewareHandler {
  /**
   * Process a request through middleware
   */
  public static async process(request: NextRequest): Promise<Response> {
    const pathname = new URL(request.url).pathname;
    
    try {
      // Check for rate limiting first
      const rateLimitResponse = await RateLimitMiddleware.applyRateLimit(request, pathname);
      if (rateLimitResponse) return rateLimitResponse;

      // Validate authentication
      const { token, response: authResponse } = await AuthMiddleware.validateAuthentication(request, pathname);
      if (authResponse) return authResponse;

      // Skip further processing for public paths
      if (AuthMiddleware.isPublicPath(pathname)) {
        return NextResponse.next();
      }

      // At this point, token should be valid for protected paths
      if (token) {
        // Validate authorization
        const authorizationResponse = AuthMiddleware.validateAuthorization(token, pathname, request);
        if (authorizationResponse) return authorizationResponse;

        // Apply security headers
        const response = NextResponse.next();
        await SecurityMiddleware.applySecurityHeaders(response);
        
        // Log request
        await AuditMiddleware.logRequest(token, {
          path: pathname,
          method: request.method,
          ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });

        return response;
      }

      // This should not happen, but just in case
      return NextResponse.next();
    } catch (error) {
      logger.error('Middleware error:', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
        path: pathname,
      });
      
      return createErrorResponse({
        status: 500,
        type: ErrorType.SERVER_ERROR,
        message: 'Internal server error'
      });
    }
  }
}

/**
 * Middleware handler function
 */
export async function middlewareHandler(request: NextRequest): Promise<Response> {
  return MiddlewareHandler.process(request);
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
 * export default function middleware(request: NextRequest) {
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