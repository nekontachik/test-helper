import { NextResponse, NextRequest } from 'next/server';
import { authUtils } from '@/lib/utils/authUtils';
import logger from '@/lib/utils/logger';
import { UserRole } from '@/types/auth';

export type Role = 'ADMIN' | 'PROJECT_MANAGER' | 'TESTER' | 'VIEWER';

interface AuthOptions {
  requireAuth?: boolean;
  requiredRoles?: Role[];
}

const defaultOptions: AuthOptions = {
  requireAuth: true,
  requiredRoles: []
};

export const withAuth = (
  handler: (req: NextRequest) => Promise<Response>,
  options: AuthOptions = defaultOptions
) => {
  return async (req: NextRequest): Promise<Response> => {
    try {
      const session = await authUtils.getSession();

      if (options.requireAuth && !session?.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      if (options.requiredRoles?.length && session?.user) {
        const hasRequiredRole = options.requiredRoles.some(
          role => session.user.role === role
        );

        if (!hasRequiredRole) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }

      // Add user info to request for logging
      const headers = new Headers(req.headers);
      headers.set('x-user-id', session?.user?.id || 'anonymous');
      headers.set('x-user-role', session?.user?.role || '');

      const requestWithUser = new NextRequest(req.url, {
        headers,
        method: req.method,
        body: req.body,
        cache: req.cache,
        credentials: req.credentials,
        integrity: req.integrity,
        keepalive: req.keepalive,
        mode: req.mode,
        redirect: req.redirect,
        referrer: req.referrer,
        referrerPolicy: req.referrerPolicy,
        signal: req.signal,
      });

      return handler(requestWithUser);
    } catch (error) {
      logger.error('Auth middleware error', { error });
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}; 