import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { RBACService } from '@/lib/auth/rbac/service';
import { Action, Resource, UserRole } from '@/types/rbac';
import logger from '@/lib/logger';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';

interface AuthOptions {
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: UserRole[];
  action?: Action;
  resource?: Resource;
}

interface AuthMiddlewareParams {
  session: Session | null;
  requireAuth?: boolean;
  requireVerified?: boolean;
  require2FA?: boolean;
  allowedRoles?: string[];
  action: Action;
  resource: Resource;
}

interface AuthResult {
  success: boolean;
  error?: string;
  status?: number;
}

export async function authMiddleware(
  params: AuthMiddlewareParams
): Promise<AuthResult> {
  try {
    const session = params.session;
    if (!session?.user) {
      return { success: false, error: 'Unauthorized', status: 401 };
    }

    // Check email verification
    if (params.requireVerified && !session.user.emailVerified) {
      return { success: false, error: 'Email verification required', status: 403 };
    }

    // Check 2FA
    if (params.require2FA && !session.user.twoFactorAuthenticated) {
      return { success: false, error: '2FA verification required', status: 403 };
    }

    // Check roles
    if (params.allowedRoles?.length) {
      const hasRole = params.allowedRoles.includes(session.user.role as UserRole);
      if (!hasRole) {
        return { success: false, error: 'Insufficient permissions', status: 403 };
      }
    }

    // Check RBAC permissions
    if (params.action && params.resource) {
      const hasPermission = await RBACService.can(
        session.user.role as UserRole,
        params.action,
        params.resource
      );

      if (!hasPermission) {
        return { success: false, error: 'Insufficient permissions', status: 403 };
      }
    }

    return { success: true };
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return { success: false, error: 'Internal server error', status: 500 };
  }
}
