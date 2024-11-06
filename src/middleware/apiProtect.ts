import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import { ActionType, ResourceType, UserRole } from '@/types/rbac';
import { RateLimitError } from '@/lib/errors/RateLimitError';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import logger from '@/lib/logger';
import type { Session } from 'next-auth';

interface ProtectConfig {
  action: ActionType;
  resource: ResourceType;
  allowUnverified?: boolean;
  require2FA?: boolean;
  rateLimit?: {
    points: number;
    duration: number;
  };
}

/**
 * Higher-order function that adds protection to API routes
 */
export function withProtect(
  handler: (request: Request, session: Session) => Promise<Response>,
  config: ProtectConfig
) {
  return async function protectedHandler(request: Request): Promise<Response> {
    try {
      // Check session
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Check email verification if required
      if (!config.allowUnverified && !session.user.emailVerified) {
        return NextResponse.json(
          { error: 'Email verification required' },
          { status: 403 }
        );
      }

      // Check 2FA if required
      if (config.require2FA && !session.user.twoFactorAuthenticated) {
        return NextResponse.json(
          { error: '2FA verification required' },
          { status: 403 }
        );
      }

      // Check RBAC permissions
      const hasPermission = await RBACService.can(
        session.user.role as UserRole,
        config.action,
        config.resource
      );

      if (!hasPermission) {
        logger.warn('Insufficient permissions', {
          userId: session.user.id,
          action: config.action,
          resource: config.resource,
        });
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Apply rate limiting if configured
      if (config.rateLimit) {
        const rateLimiter = new RateLimiter();
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        try {
          await rateLimiter.checkLimit(ip, config.rateLimit);
        } catch (error) {
          if (error instanceof RateLimitError) {
            return NextResponse.json(
              { error: 'Rate limit exceeded' },
              { 
                status: 429, 
                headers: { 
                  'Retry-After': String(Math.ceil(error.info.resetIn / 1000))
                } 
              }
            );
          }
          throw error;
        }
      }

      // Call original handler with session
      return handler(request, session);
    } catch (error) {
      logger.error('API protection error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 