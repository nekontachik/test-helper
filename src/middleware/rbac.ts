import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole, UserRoles } from '@/types/rbac';
import logger from '@/lib/logger';
import type { JWT } from 'next-auth/jwt';

interface RBACOptions {
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

interface AuthToken extends JWT {
  sub: string;
  role?: string;
}

function isValidUserRole(role: string | undefined): role is UserRole {
  if (!role) return false;
  return Object.values(UserRoles).includes(role as UserRole);
}

export function withRBAC(handler: Function, options: RBACOptions) {
  return async function rbacMiddleware(request: Request) {
    try {
      const token = await getToken({ req: request as any }) as AuthToken | null;

      if (!token?.sub) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (options.roles) {
        if (!token.role || !isValidUserRole(token.role)) {
          logger.warn('Invalid role access attempt', {
            userId: token.sub,
            role: token.role,
            path: new URL(request.url).pathname,
          });
          return NextResponse.json(
            { error: 'Invalid user role' },
            { status: 403 }
          );
        }

        if (!options.roles.includes(token.role)) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      return handler(request);
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
} 