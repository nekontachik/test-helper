import { NextApiResponse } from 'next';
import { AuthorizationError } from '@/lib/errors';
import { AuthenticatedRequest } from './authenticate';

export function authorizeMiddleware(allowedRoles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void
  ) => {
    if (!req.user) {
      throw new AuthorizationError('User not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AuthorizationError('User not authorized');
    }

    next();
  };
}
