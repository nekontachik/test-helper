import { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';
import { logger } from '@/lib/utils/logger';
import type { JWT } from 'next-auth/jwt';
import type { User } from 'next-auth';

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
      async authorize(credentials, req): Promise<User | null> {
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
              emailNotificationsEnabled: true,
              userPermissions: {
                select: {
                  permission: {
                    select: {
                      id: true,
                      name: true,
                      description: true
                    }
                  }
                }
              }
            },
          });

          if (!user) {
            logger.warn('Login attempt with non-existent email', {
              email: credentials.email,
            });
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            logger.warn('Failed login attempt', {
              userId: user.id,
            });
            return null;
          }

          // Get permissions from user permissions
          const permissions = user.userPermissions.map(up => ({
            id: up.permission.id,
            name: up.permission.name,
            description: up.permission.description
          }));

          logger.info('Successful login', { userId: user.id });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: null,
            role: user.role as UserRole,
            permissions,
            status: user.status,
            emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
            twoFactorEnabled: user.twoFactorEnabled,
            twoFactorAuthenticated: false,
            emailVerified: user.emailVerified
          } as User;
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
};
