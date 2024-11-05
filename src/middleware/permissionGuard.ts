import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRoles } from '@/types/rbac';
import logger from '@/lib/logger';
import type { JWT } from 'next-auth/jwt';

interface AuthToken extends JWT {
  sub: string;
  role?: string;
}

interface PermissionGuardConfig {
  roles?: (keyof typeof UserRoles)[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

function isValidUserRole(role: string | undefined): role is keyof typeof UserRoles {
  if (!role) return false;
  return Object.values(UserRoles).includes(role as keyof typeof UserRoles);
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

      if (!config.roles.includes(token.role as keyof typeof UserRoles)) {
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