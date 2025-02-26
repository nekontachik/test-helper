import { NextResponse } from 'next/server';
import { getToken as _getToken } from 'next-auth/jwt';
import type { UserRole } from '@/types/auth';
import type { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export interface AuthOptions {
  allowedRoles: UserRole[];
}

abstract class BaseAuthError extends Error {
  abstract statusCode: number;
}

class _UnauthorizedError extends BaseAuthError {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class _ForbiddenError extends BaseAuthError {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function withAuth(
  handler: (req: NextRequest, session: any) => Promise<Response>,
  options: AuthOptions
) {
  return async function (req: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (options.allowedRoles && !options.allowedRoles.includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return handler(req, session);
  };
}
