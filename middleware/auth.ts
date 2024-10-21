import { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticationError } from '@/lib/errors';

export function authMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AuthenticationError('No authorization header');
  }

  // Implement your authentication logic here
  // For example, verify a JWT token

  next();
}
