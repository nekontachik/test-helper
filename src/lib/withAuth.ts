import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/auth';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';

export interface AuthOptions {
  allowedRoles: UserRole[];
}

abstract class BaseAuthError extends Error {
  abstract statusCode: number;
}

class UnauthorizedError extends BaseAuthError {
  statusCode = 401;
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends BaseAuthError {
  statusCode = 403;
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export async function withAuth(
  handler: Function,
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
