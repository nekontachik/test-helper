import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '@/lib/errors';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export function authenticateMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AuthenticationError('No authorization header');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch {
    throw new AuthenticationError('Invalid token');
  }
}
