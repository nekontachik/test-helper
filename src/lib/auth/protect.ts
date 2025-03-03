import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { isValidUserRole, hasRequiredRole } from '@/lib/auth/roles';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { AuditService } from '@/lib/audit/auditService';
import { logger } from '@/lib/logger';
import { handleApiError, AuthError, PermissionError } from '@/lib/api/errorHandler';
import type { UserRole } from '@/types/auth';
import { AuditLogType } from '@/types/audit';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

export interface ProtectOptions {
  // Auth options
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
  
  // Rate limiting
  rateLimit?: {
    points: number;
    duration: number;
  };
  
  // Audit options
  audit?: boolean;
  auditAction?: string;
}

// Define a more specific type for RouteHandler
type RouteHandler<T> = (
  req: NextRequest | Request,
  context: {
    params: Record<string, string>;
    session: Session;
  }
) => Promise<NextResponse<T>>;

/**
 * Higher-order function to protect API routes
 * @param handler - The route handler function
 * @param options - Protection options
 * @returns Protected route handler
 */
export function protect<T>(
  handler: RouteHandler<T>,
  options: ProtectOptions = {}
): (req: NextRequest | Request, context: { params: Record<string, string> }) => Promise<NextResponse> {
  return async (req: NextRequest | Request, context: { params: Record<string, string> }) => {
    try {
      // Get session
      const session = await getServerSession(authOptions);
      
      // Check authentication
      if (!session?.user) {
        throw new AuthError('Authentication required');
      }
      
      // Check role-based access
      if (options.roles && options.roles.length > 0) {
        const userRole = session.user.role as UserRole | undefined;
        
        if (!userRole || !isValidUserRole(userRole) || 
            !hasRequiredRole(userRole, options.roles)) {
          logger.warn('Insufficient permissions', {
            userId: session.user.id,
            role: userRole,
            requiredRoles: options.roles,
            path: req.url
          });
          
          throw new PermissionError('Insufficient permissions');
        }
      }
      
      // Check email verification
      if (options.requireVerified && !session.user.emailVerified) {
        throw new PermissionError('Email verification required');
      }
      
      // Check 2FA
      if (options.require2FA && !session.user.twoFactorAuthenticated) {
        throw new PermissionError('2FA verification required');
      }
      
      // Apply rate limiting
      if (options.rateLimit) {
        const rateLimiter = new RateLimiter();
        const ip = req.headers.get('x-forwarded-for') || 'unknown';
        
        try {
          await rateLimiter.checkLimit(ip, options.rateLimit);
        } catch {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'Retry-After': String(options.rateLimit?.duration || 60)
              }
            }
          );
        }
      }
      
      // Log for audit
      if (options.audit) {
        await AuditService.log({
          userId: session.user.id,
          type: AuditLogType.SYSTEM,
          action: options.auditAction || 'API_REQUEST',
          metadata: {
            path: req.url,
            method: req.method,
          },
          status: 'SUCCESS'
        });
      }
      
      // Call handler with session
      return await handler(req, { ...context, session });
    } catch (error) {
      return handleApiError(error);
    }
  };
} 