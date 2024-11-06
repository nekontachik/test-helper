import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';
import { logger } from '@/lib/utils/logger';
import type { JWT } from 'next-auth/jwt';

interface ExtendedJWT extends JWT {
  id: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              role: true,
              twoFactorEnabled: true,
              emailVerified: true,
              status: true,
              failedLoginAttempts: true,
              lockedUntil: true,
              image: true,
            },
          });

          if (!user) {
            logger.warn('Login attempt with non-existent email', {
              email: credentials.email,
            });
            return null;
          }

          // Check account status
          if (user.status !== 'ACTIVE') {
            logger.warn('Login attempt on inactive account', {
              userId: user.id,
              status: user.status,
            });
            return null;
          }

          // Check account lockout
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            logger.warn('Login attempt on locked account', {
              userId: user.id,
              lockedUntil: user.lockedUntil,
            });
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            // Increment failed login attempts
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: {
                  increment: 1,
                },
              },
            });

            logger.warn('Failed login attempt', {
              userId: user.id,
              failedAttempts: user.failedLoginAttempts + 1,
            });
            return null;
          }

          // Reset failed login attempts on successful login
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              lockedUntil: null,
              lastLogin: new Date(),
            },
          });

          logger.info('Successful login', { userId: user.id });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role as UserRole,
            twoFactorEnabled: user.twoFactorEnabled,
            twoFactorAuthenticated: false,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          logger.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }): Promise<ExtendedJWT> {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorAuthenticated: user.twoFactorAuthenticated,
          emailVerified: user.emailVerified,
        };
      }
      return token as ExtendedJWT;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedJWT;
      session.user = {
        id: extendedToken.id,
        email: extendedToken.email,
        name: extendedToken.name ?? null,
        image: extendedToken.picture ?? null,
        role: extendedToken.role,
        twoFactorEnabled: extendedToken.twoFactorEnabled,
        twoFactorAuthenticated: extendedToken.twoFactorAuthenticated,
        emailVerified: extendedToken.emailVerified,
      };
      return session;
    }
  },
  events: {
    async signIn({ user }) {
      logger.info('User signed in', { userId: user.id });
    },
    async signOut({ token }) {
      logger.info('User signed out', { userId: token.sub });
    },
  },
  logger: {
    error: (code, metadata) => {
      logger.error('Auth error:', { code, metadata });
    },
    warn: (code) => {
      logger.warn('Auth warning:', { code });
    },
  },
};
