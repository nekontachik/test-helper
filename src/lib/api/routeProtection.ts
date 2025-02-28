import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';
import type { UserRole } from '@/types/auth';

export type RouteHandler = (
  req: NextRequest,
  context: { params: Record<string, string> }
) => Promise<NextResponse>;

export interface ProtectedRouteOptions {
  allowedRoles?: UserRole[];
  requireVerifiedEmail?: boolean;
}

/**
 * Higher-order function that protects API routes using NextAuth.js authentication
 * @param handler The route handler function
 * @param options Configuration options for route protection
 * @returns A wrapped handler that checks authentication and authorization
 */
export function withProtectedRoute(
  handler: RouteHandler,
  options: ProtectedRouteOptions = {}
): RouteHandler {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      // Get the user's session
      const session = await getServerSession(authOptions);

      // Check if user is authenticated
      if (!session?.user) {
        logger.warn('Unauthorized access attempt to protected route', { 
          path: req.nextUrl.pathname,
          method: req.method
        });
        
        return NextResponse.json(
          { error: 'Unauthorized', message: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check role-based access if required
      if (options.allowedRoles && options.allowedRoles.length > 0) {
        // Default to USER role if not specified in session
        const userRole = (session.user.role || 'USER') as UserRole;
        
        if (!options.allowedRoles.includes(userRole)) {
          logger.warn('Insufficient permissions for protected route', {
            userId: session.user.id,
            userRole,
            requiredRoles: options.allowedRoles,
            path: req.nextUrl.pathname
          });
          
          return NextResponse.json(
            { error: 'Forbidden', message: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Check for verified email if required
      if (options.requireVerifiedEmail) {
        // Safe type checking using in operator
        const emailVerified = 'emailVerified' in session.user ? 
          !!session.user.emailVerified : 
          false;
          
        if (!emailVerified) {
          logger.warn('Unverified email access attempt to protected route', {
            userId: session.user.id,
            path: req.nextUrl.pathname
          });
          
          return NextResponse.json({
            error: 'Forbidden',
            message: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED'
          }, { status: 403 });
        }
      }

      // Enhance the request with the user session
      const headers = new Headers(req.headers);
      headers.set('x-user-id', session.user.id);
      if (session.user.role) {
        headers.set('x-user-role', session.user.role as string);
      }

      // Create a new request with the updated headers
      const updatedRequest = new Request(req.url, {
        method: req.method,
        headers: headers,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        signal: req.signal
      });

      // If all checks pass, proceed to the handler
      // @ts-expect-error - Type mismatch between Request and NextRequest is expected
      return handler(updatedRequest, context);
    } catch (error) {
      // Log any errors that occur during authentication
      logger.error('Error in route protection middleware', { 
        error,
        path: req.nextUrl.pathname,
        method: req.method
      });
      
      return NextResponse.json(
        { error: 'Internal Server Error', message: 'Authentication service unavailable' },
        { status: 500 }
      );
    }
  };
} 