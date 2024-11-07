import { NextApiResponse } from 'next';
import { AuthorizationError } from '@/lib/errors';
import { AuthenticatedRequest } from './authenticate';
import { UserRole } from '@/types/auth';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean | null;
  twoFactorAuthenticated?: boolean;
}

export interface AuthorizeOptions {
  allowedRoles: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

export function authorizeMiddleware(options: AuthorizeOptions) {
  return async function(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) {
    const user = req.user as AuthenticatedUser;

    if (!user) {
      throw new AuthorizationError('User not authenticated');
    }

    if (options.requireVerified && !user.emailVerified) {
      throw new AuthorizationError('Email verification required');
    }

    if (options.require2FA && !user.twoFactorAuthenticated) {
      throw new AuthorizationError('Two-factor authentication required');
    }

    if (!options.allowedRoles.includes(user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
}
