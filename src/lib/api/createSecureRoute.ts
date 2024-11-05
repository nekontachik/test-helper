import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withAudit } from '@/middleware/audit';
import { SecurityService } from '@/lib/security/securityService';
import { Action, Resource } from '@/types/rbac';
import { Session } from 'next-auth';

interface SecureRouteConfig {
  // Auth options
  requireAuth?: boolean;
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: string[];

  // RBAC options
  action: Action;
  resource: Resource;

  // Rate limiting options
  rateLimit?: {
    points: number;
    duration: number;
  };

  // CSRF protection
  requireCsrf?: boolean;

  // Audit options
  audit?: {
    action: string;
    getMetadata?: (req: Request) => Promise<Record<string, any>>;
  };
}

export function createSecureRoute(
  handler: (req: Request, session: Session) => Promise<Response>,
  config: SecureRouteConfig
) {
  return async function(request: Request) {
    try {
      // Apply security headers
      const headers = SecurityService.getSecurityHeaders();
      
      // Verify CSRF token if required
      if (config.requireCsrf && request.method !== 'GET') {
        const csrfToken = request.headers.get('x-csrf-token');
        const session = await getServerSession();
        
        if (!csrfToken || !session?.id || 
            !await SecurityService.validateCsrfToken(session.id, csrfToken)) {
          return NextResponse.json(
            { error: 'Invalid CSRF token' },
            { status: 403, headers }
          );
        }
      }

      // Apply rate limiting
      if (config.rateLimit) {
        const rateLimitResponse = await withRateLimit(
          () => Promise.resolve(null),
          {
            points: config.rateLimit.points,
            duration: config.rateLimit.duration,
          }
        )(request);

        if (rateLimitResponse.status !== 200) {
          return new Response(rateLimitResponse.body, {
            status: rateLimitResponse.status,
            headers: { ...headers, ...rateLimitResponse.headers },
          });
        }
      }

      // Apply authentication and authorization
      const protectedHandler = withAuth(handler, {
        requireVerified: config.requireVerified,
        require2FA: config.require2FA,
        allowedRoles: config.allowedRoles,
        action: config.action,
        resource: config.resource,
      });

      // Apply audit logging
      const auditedHandler = withAudit(protectedHandler, {
        action: config.audit?.action || config.action,
        getMetadata: config.audit?.getMetadata,
      });

      // Execute the handler
      const response = await auditedHandler(request);

      // Add security headers to response
      Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    } catch (error) {
      console.error('Secure route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 