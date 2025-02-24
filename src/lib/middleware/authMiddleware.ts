import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { Session } from 'next-auth';

/**
 * Higher-order function for auth checks
 */
export const withAuth = <T>(handler: (session: Session) => Promise<T>) => {
  return async () => {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      throw ErrorFactory.create('UNAUTHORIZED', 'Not authenticated');
    }
    
    return handler(session);
  };
}; 