import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import type { UserRole } from '@/types/auth';
import type { Action, Resource } from '@/lib/auth/rbac/types';

type HandlerFunction<T extends Record<string, string> = Record<string, string>> = (
  req: Request,
  context: { params: T }
) => Promise<NextResponse>;

interface AuthOptions {
  allowedRoles: UserRole[];
  requireVerified?: boolean;
  action?: Action;
  resource?: Resource;
  checkOwnership?: boolean;
  allowTeamMembers?: boolean;
  getProjectId?: (req: Request) => string;
}

export function withAuth<T extends Record<string, string>>(
  handler: HandlerFunction<T>,
  options: AuthOptions
) {
  return async function authHandler(
    req: Request,
    context: { params: T }
  ) {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has required role
    const userRole = session.user.role as UserRole;
    if (!options.allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { message: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check verified requirement if specified
    if (options.requireVerified && !session.user.emailVerified) {
      return NextResponse.json(
        { message: 'Email verification required' },
        { status: 403 }
      );
    }

    // Check ownership if required
    if (options.checkOwnership && options.getProjectId) {
      const _projectId = options.getProjectId(req);
      // Add your ownership check logic here
    }

    return handler(req, context);
  };
}
