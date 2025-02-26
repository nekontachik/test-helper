import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import type { Resource} from '@/types/rbac';
import { Action, UserRole } from '@/types/rbac';
import { AuditAction, AuditLogType } from '@/types/audit';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { AuditService } from '@/lib/audit/auditService';
import { 
  AuthenticationError, 
  AuthorizationError,
  RateLimitError 
} from '@/lib/errors';
import { logger } from '@/lib/utils/logger';
import type { Session } from 'next-auth';

interface ErrorResponse {
  error: string;
}

interface RateLimitConfig {
  points: number;
  duration: number;
  type: string;
}

interface ProtectedRouteConfig {
  // Auth options
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: UserRole[];

  // RBAC options
  action: Action;
  resource: Resource;
  checkOwnership?: boolean;
  allowTeamMembers?: boolean;

  // Rate limiting options
  rateLimit?: RateLimitConfig;

  // Audit options
  audit?: {
    action: AuditAction;
    getMetadata?: (req: Request) => Promise<Record<string, unknown>>;
    sensitiveFields?: string[];
  };
}

type ProtectedRouteHandler<T> = (
  req: Request,
  context: {
    session: Session;
    params?: Record<string, string>;
  }
) => Promise<NextResponse<T | ErrorResponse>>;

export function createProtectedRoute<T>(
  handler: ProtectedRouteHandler<T>,
  config: ProtectedRouteConfig
) {
  return async function(
    request: Request,
    { params }: { params?: Record<string, string> } = {}
  ): Promise<NextResponse<T | ErrorResponse>> {
    try {
      // Check session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        throw new AuthenticationError('Unauthorized');
      }

      // Check email verification if required
      if (config.requireVerified && !session.user.emailVerified) {
        throw new AuthorizationError('Email verification required');
      }

      // Check 2FA if required
      if (config.require2FA && !session.user.twoFactorAuthenticated) {
        throw new AuthorizationError('2FA verification required');
      }

      // Check role-based access
      if (config.allowedRoles?.length) {
        const hasRole = config.allowedRoles.includes(session.user.role as UserRole);
        if (!hasRole) {
          throw new AuthorizationError('Insufficient role permissions');
        }
      }

      // Check RBAC permissions
      const hasPermission = await RBACService.checkPermission(
        session.user.id,
        session.user.role as UserRole,
        {
          action: config.action,
          resource: config.resource,
          resourceId: config.checkOwnership ? params?.id : undefined
        }
      );

      if (!hasPermission) {
        logger.warn('Insufficient permissions', {
          userId: session.user.id,
          action: config.action,
          resource: config.resource,
        });
        throw new AuthorizationError('Insufficient permissions');
      }

      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateLimiter = new RateLimiter();
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        await rateLimiter.checkLimit(ip, config.rateLimit);
      }

      // Log audit event if configured
      if (config.audit) {
        const metadata = config.audit.getMetadata 
          ? await config.audit.getMetadata(request)
          : {
              method: request.method,
              path: new URL(request.url).pathname,
              ip: request.headers.get('x-forwarded-for') || undefined,
              userAgent: request.headers.get('user-agent') || undefined,
            };

        await AuditService.log({
          userId: session.user.id,
          type: AuditLogType.SYSTEM,
          action: config.audit.action,
          metadata,
        });
      }

      // Call original handler with session
      return handler(request, { session, params });
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json<ErrorResponse>(
          { error: error.message },
          { status: 401 }
        );
      }

      if (error instanceof AuthorizationError) {
        return NextResponse.json<ErrorResponse>(
          { error: error.message },
          { status: 403 }
        );
      }

      if (error instanceof RateLimitError) {
        return NextResponse.json<ErrorResponse>(
          { error: 'Rate limit exceeded' },
          { 
            status: 429, 
            headers: { 
              'Retry-After': String(Math.ceil(error.resetIn / 1000))
            } 
          }
        );
      }

      logger.error('Protected route error:', error);
      return NextResponse.json<ErrorResponse>(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to create common route configurations
export const RouteConfig = {
  read: (resource: Resource): ProtectedRouteConfig => ({
    action: Action.READ,
    resource,
    rateLimit: {
      type: 'api:read',
      points: 100,
      duration: 60,
    },
    audit: {
      action: AuditAction.API_REQUEST,
    },
  }),

  create: (resource: Resource): ProtectedRouteConfig => ({
    action: Action.CREATE,
    resource,
    requireVerified: true,
    rateLimit: {
      type: 'api:create',
      points: 50,
      duration: 60,
    },
    audit: {
      action: AuditAction.API_REQUEST,
    },
  }),

  update: (resource: Resource): ProtectedRouteConfig => ({
    action: Action.UPDATE,
    resource,
    requireVerified: true,
    checkOwnership: true,
    rateLimit: {
      type: 'api:update',
      points: 50,
      duration: 60,
    },
    audit: {
      action: AuditAction.API_REQUEST,
    },
  }),

  delete: (resource: Resource): ProtectedRouteConfig => ({
    action: Action.DELETE,
    resource,
    requireVerified: true,
    checkOwnership: true,
    rateLimit: {
      type: 'api:delete',
      points: 30,
      duration: 60,
    },
    audit: {
      action: AuditAction.API_REQUEST,
    },
  }),

  admin: (resource: Resource, action: Action): ProtectedRouteConfig => ({
    action,
    resource,
    requireVerified: true,
    require2FA: true,
    allowedRoles: [UserRole.ADMIN],
    rateLimit: {
      type: 'api:admin',
      points: 30,
      duration: 60,
    },
    audit: {
      action: AuditAction.API_REQUEST,
    },
  }),
}; 