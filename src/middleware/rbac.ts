import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
// Create a local enum if it's not exported from the module
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  GUEST = 'GUEST'
}
import logger from '@/lib/logger';
import type { JWT } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

interface RBACOptions {
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

interface AuthToken extends Omit<JWT, 'role'> {
  sub: string;
  role: UserRole;
}

function isValidUserRole(role: string | undefined): role is UserRole {
  if (!role) return false;
  return Object.values(UserRole).includes(role as UserRole);
}

export function withRBAC(
  handler: (request: Request) => Promise<Response>, 
  options: RBACOptions
) {
  return async function rbacMiddleware(request: Request): Promise<Response> {
    try {
      // Use NextRequest type for getToken compatibility
      const req = request as unknown as NextRequest;
      const token = await getToken({ req }) as AuthToken | null;

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