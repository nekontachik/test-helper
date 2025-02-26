import { authOptions } from '../[...nextauth]/route';
import { UserRole } from '@/types/auth';
import type { Session } from 'next-auth';

describe('NextAuth Session Handling', () => {
  const mockToken = {
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
  };

  const mockUser = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    role: UserRole.USER,
    emailVerified: null,
  };

  it('should add user role to JWT token', async () => {
    const jwt = authOptions.callbacks?.jwt;
    if (!jwt) throw new Error('JWT callback not found');

    const token = await jwt({ token: {}, user: mockUser, account: null, profile: undefined, trigger: 'signIn' });

    expect(token).toEqual(expect.objectContaining({
      role: UserRole.USER,
    }));
  });

  it('should add user role to session', async () => {
    const session = authOptions.callbacks?.session;
    if (!session) throw new Error('Session callback not found');

    const mockSession: Session = {
      user: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.USER,
      },
      expires: '',
    };

    const result = await session({
      session: mockSession,
      token: mockToken,
      user: mockUser,
      newSession: null,
      trigger: 'update',
    });

    expect(result.user).toEqual(expect.objectContaining({
      role: UserRole.USER,
    }));
  });
});
