import { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { AuthError } from '@/lib/errors/AuthError';
import type { Permission } from '@/types/rbac';
import type { JWT } from 'next-auth/jwt';

interface AuthMiddlewareConfig {
  permissions?: Permission[];
}

interface AuthToken extends JWT {
  permissions: Permission[];
}

export async function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void,
  config: AuthMiddlewareConfig = {}
) {
  try {
    const token = await getToken({ req }) as AuthToken | null;

    if (!token) {
      throw new AuthError('Unauthorized', 'UNAUTHORIZED', 401);
    }

    if (config.permissions?.length) {
      const hasPermission = config.permissions.every(permission =>
        token.permissions?.includes(permission)
      );

      if (!hasPermission) {
        throw new AuthError('Insufficient permissions', 'FORBIDDEN', 403);
      }
    }

    next();
  } catch (error) {
    if (error instanceof AuthError) {
      res.status(error.status).json({ error: error.message, code: error.code });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
