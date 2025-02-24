import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ErrorFactory } from '@/lib/errors/BaseError';
import type { Session } from 'next-auth';

export const authUtils = {
  async requireAuth(): Promise<Session> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw ErrorFactory.create('UNAUTHORIZED', 'Not authenticated');
    }
    return session;
  },

  async getSession(): Promise<Session | null> {
    return getServerSession(authOptions);
  },

  isAuthenticated(session: Session | null): session is Session {
    return !!session?.user;
  }
}; 