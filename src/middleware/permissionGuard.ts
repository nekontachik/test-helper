import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/rbac';
import logger from '@/lib/logger';
import type { JWT } from 'next-auth/jwt';

interface AuthToken extends JWT {
  sub: string;
  role?: string;
}

interface PermissionGuardConfig {
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

function isValidUserRole(role: string | undefined): role is UserRole {
  if (!role) return false;
  return Object.values(UserRole).includes(role as UserRole);
}

export async function permissionGuard(
  request: Request,
  config: PermissionGuardConfig
): Promise<Response | undefined> {
  try {
    const token = await getToken({ req: request as any }) as AuthToken | null;

    if (!token?.sub) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (config.roles) {
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

      if (!config.roles.includes(token.role as UserRole)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    return undefined;
  } catch (error) {
    logger.error('Permission guard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 