import type { JWT } from 'next-auth/jwt';
import type { UserRole, AccountStatus } from '@/types/auth';
import type { CustomUser, CustomSessionUser } from './types';
import type { User, Account } from 'next-auth';
import type { Session } from 'next-auth';

/**
 * NextAuth callbacks
 */
export const callbacks = {
  /**
   * Handle sign-in flow, including email verification and 2FA
   */
  async signIn({ user, account }: { user: User; account: Account | null }) {
    // Skip email verification for OAuth
    if (account?.provider !== 'credentials') {
      return true;
    }

    // Check email verification
    if (!user.emailVerified) {
      return '/auth/verify-email';
    }

    // Handle 2FA
    if ((user as CustomUser).twoFactorEnabled && !(user as CustomUser).twoFactorAuthenticated) {
      return '/auth/2fa';
    }

    return true;
  },

  /**
   * Add custom properties to the JWT token
   */
  async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
    if (user) {
      const customUser = user as unknown as CustomUser;
      return {
        ...token,
        id: customUser.id,
        email: customUser.email,
        name: customUser.name,
        role: customUser.role,
        permissions: customUser.permissions,
        status: customUser.status,
        emailNotificationsEnabled: customUser.emailNotificationsEnabled,
        twoFactorEnabled: customUser.twoFactorEnabled,
        twoFactorAuthenticated: customUser.twoFactorAuthenticated || false,
        emailVerified: customUser.emailVerified instanceof Date ? 
          customUser.emailVerified.toISOString() : 
          customUser.emailVerified
      };
    }
    return token;
  },

  /**
   * Add custom properties to the session
   */
  async session({ session, token }: { session: Session; token: JWT }) {
    if (session.user) {
      session.user = {
        ...session.user,
        id: token.id,
        email: token.email ?? null,
        name: token.name ?? null,
        role: token.role as UserRole,
        permissions: token.permissions,
        status: token.status as AccountStatus,
        emailNotificationsEnabled: Boolean(token.emailNotificationsEnabled),
        twoFactorEnabled: Boolean(token.twoFactorEnabled),
        twoFactorAuthenticated: Boolean(token.twoFactorAuthenticated),
        emailVerified: token.emailVerified
      } as CustomSessionUser;
    }
    return session;
  }
}; 