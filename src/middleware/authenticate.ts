import type { NextRequest } from 'next/server';
import { AuthError } from '@/lib/errors/AuthError';
import { validateToken } from '@/lib/auth/token';
import type { Permission } from '@/lib/auth/types';
import type { AuthUser } from '@/types/auth';

export async function authenticate(
  request: NextRequest,
  requiredPermissions?: Permission[]
): Promise<AuthUser> {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];

  if (!token) {
    throw new AuthError(
      'Authentication required',
      'INVALID_TOKEN',
      401
    );
  }

  try {
    const user = await validateToken(token) as AuthUser;

    if (requiredPermissions?.length) {
      const hasPermission = requiredPermissions.every(permission =>
        user.permissions.includes(permission)
      );

      if (!hasPermission) {
        throw new AuthError(
          'Insufficient permissions',
          'INSUFFICIENT_PERMISSIONS',
          403
        );
      }
    }

    return user;
  } catch (error) {
    if (error instanceof AuthError) {
      throw error;
    }
    throw new AuthError(
      'Invalid token',
      'INVALID_TOKEN',
      401
    );
  }
} 