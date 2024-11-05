import { NextResponse } from 'next/server';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withAudit } from '@/middleware/audit';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { AuditAction } from '@/middleware/audit';
import { Session } from 'next-auth';

interface ProtectedRouteConfig {
  // Auth options
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: string[];

  // RBAC options
  action: Action;
  resource: Resource;
  checkOwnership?: boolean;
  allowTeamMembers?: boolean;

  // Rate limiting options
  rateLimit?: {
    type: string;
    points?: number;
    duration?: number;
  };

  // Audit options
  audit?: {
    action: AuditAction;
    getMetadata?: (req: Request, res: Response) => Promise<Record<string, any>>;
    sensitiveFields?: string[];
  };
}

type ProtectedRouteHandler<T = any> = (
  req: Request,
  context: {
    session: Session;
    params?: Record<string, string>;
  }
) => Promise<NextResponse<T>>;

export function createProtectedRoute<T = any>(
  handler: ProtectedRouteHandler<T>,
  config: ProtectedRouteConfig
) {
  // Start with the base handler
  let protectedHandler: any = handler;

  // Add audit logging if configured
  if (config.audit) {
    protectedHandler = withAudit(protectedHandler, {
      action: config.audit.action,
      resource: config.resource,
      getResourceId: (req: Request) => {
        const url = new URL(req.url);
        return url.pathname.split('/').pop()!;
      },
      getMetadata: config.audit.getMetadata,
      sensitiveFields: config.audit.sensitiveFields,
    });
  }

  // Add rate limiting if configured
  if (config.rateLimit) {
    protectedHandler = withRateLimit(
      protectedHandler,
      config.rateLimit.type
    );
  }

  // Add authentication and authorization
  protectedHandler = withAuth(protectedHandler, {
    requireVerified: config.requireVerified,
    require2FA: config.require2FA,
    allowedRoles: config.allowedRoles,
    action: config.action,
    resource: config.resource,
    checkOwnership: config.checkOwnership,
    allowTeamMembers: config.allowTeamMembers,
  });

  // Return the final wrapped handler
  return async function(
    request: Request,
    { params }: { params?: Record<string, string> } = {}
  ) {
    try {
      return await protectedHandler(request, { params });
    } catch (error) {
      console.error('Protected route error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Helper function to create common route configurations
export const RouteConfig = {
  // Read operations
  read: (resource: Resource) => ({
    action: Action.READ,
    resource,
    rateLimit: { type: 'api:read' },
    audit: { action: AuditAction.READ },
  }),

  // Create operations
  create: (resource: Resource) => ({
    action: Action.CREATE,
    resource,
    requireVerified: true,
    rateLimit: { type: 'api:create' },
    audit: { action: AuditAction.CREATE },
  }),

  // Update operations
  update: (resource: Resource) => ({
    action: Action.UPDATE,
    resource,
    requireVerified: true,
    checkOwnership: true,
    rateLimit: { type: 'api:update' },
    audit: { action: AuditAction.UPDATE },
  }),

  // Delete operations
  delete: (resource: Resource) => ({
    action: Action.DELETE,
    resource,
    requireVerified: true,
    checkOwnership: true,
    rateLimit: { type: 'api:delete' },
    audit: { action: AuditAction.DELETE },
  }),

  // Admin operations
  admin: (resource: Resource, action: Action) => ({
    action,
    resource,
    requireVerified: true,
    require2FA: true,
    allowedRoles: ['ADMIN'],
    rateLimit: { type: 'api:admin' },
    audit: { action: AuditAction.MANAGE },
  }),
}; 