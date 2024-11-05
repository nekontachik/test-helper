import { NextApiResponse } from 'next';
import { AuthorizationError } from '@/lib/errors';
import { AuthenticatedRequest } from './authenticate';
import { UserRole } from '@/types/auth';

export interface AuthorizeOptions {
  allowedRoles: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

export function authorizeMiddleware(options: AuthorizeOptions) {
  return async function(req: AuthenticatedRequest, res: NextApiResponse, next: () => void) {
    const { user } = req;

    if (!user) {
      throw new AuthorizationError('User not authenticated');
    }

    if (options.requireVerified && !user.emailVerified) {
      throw new AuthorizationError('Email not verified');
    }

    if (options.require2FA && !user.twoFactorAuthenticated) {
      throw new AuthorizationError('2FA required');
    }

    if (!options.allowedRoles.includes(user.role)) {
      throw new AuthorizationError('Insufficient permissions');
    }

    next();
  };
}
