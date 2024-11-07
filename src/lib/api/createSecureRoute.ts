import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rateLimit';
import { auditLogMiddleware } from '@/middleware/audit';
import { SecurityService } from '@/lib/security/securityService';
import { Action, Resource, UserRole } from '@/types/rbac';
import { Session } from 'next-auth';

interface SecureRouteConfig {
  requireAuth?: boolean;
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: UserRole[];
  action: Action;
  resource: Resource;
  rateLimit?: {
    points: number;
    duration: number;
  };
  requireCsrf?: boolean;
  audit?: {
    action: string;
    getMetadata?: (req: Request) => Promise<Record<string, unknown>>;
  };
}

type SecureRouteHandler = (
  request: Request, 
  context: { session: Session | null }
) => Promise<Response>;

type SecureRouteResponse = Response | NextResponse;

export function createSecureRoute(
  handler: SecureRouteHandler,
  config: SecureRouteConfig
) {
  return async function(request: Request): Promise<SecureRouteResponse> {
    const headers = SecurityService.getSecurityHeaders();
    
    try {
      const session = await getServerSession(authOptions);

      // CSRF Protection
      if (config.requireCsrf && request.method !== 'GET') {
        const csrfToken = request.headers.get('x-csrf-token');
        const userId = session?.user?.id;
        
        if (!csrfToken || !userId || 
            !await SecurityService.validateCsrfToken(userId, csrfToken)) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403, headers }
          );
        }
      }

      // Rate Limiting
      if (config.rateLimit) {
        const rateLimitResult = await rateLimitMiddleware({
          request,
          points: config.rateLimit.points,
          duration: config.rateLimit.duration
        });

        if (!rateLimitResult.success) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429, 
              headers: { 
                ...headers,
                'Retry-After': String(rateLimitResult.retryAfter ?? 60)
              }
            }
          );
        }
      }

      // Authentication & Authorization
      const authResult = await authMiddleware({
        session,
        requireAuth: config.requireAuth,
        requireVerified: config.requireVerified,
        require2FA: config.require2FA,
        allowedRoles: config.allowedRoles,
        action: config.action,
        resource: config.resource
      });

      if (!authResult.success) {
        return NextResponse.json(
          { error: authResult.error },
          { status: authResult.status ?? 401, headers }
        );
      }

      // Execute Handler
      const response = await handler(request, { session });

      // Audit Logging
      if (config.audit) {
        const metadata = config.audit.getMetadata 
          ? await config.audit.getMetadata(request)
          : undefined;

        await auditLogMiddleware({
          request,
          session,
          action: config.audit.action,
          metadata
        });
      }

      // Add Security Headers to Response
      const finalHeaders = new Headers(response.headers);
      Object.entries(headers).forEach(([key, value]) => {
        finalHeaders.set(key, value);
      });

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: finalHeaders
      });

    } catch (error) {
      console.error('Secure route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500, headers }
      );
    }
  };
} 