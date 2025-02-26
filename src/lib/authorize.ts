import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthorizationError } from './errors';

export function authorizeMiddleware(allowedRoles: string[]) {
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    // Implement your authorization logic here
    // For example, check if the user has the required role
    const userRole = req.headers['x-user-role'] as string;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AuthorizationError('User not authorized');
    }

    next();
  };
}
