import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SESSION_CONFIG, COOKIE_OPTIONS } from '@/lib/auth/session';
import { csrfOptions, validateCSRFToken } from '@/lib/auth/csrf';
import { AUTH_ERRORS } from '@/lib/utils/error';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import type { UserRole } from '@/types/auth';
import { verifyTOTP } from '@/lib/utils/totp';
import { SecurityService } from '@/services/securityService';
import { ActivityService } from '@/services/activityService';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: SESSION_CONFIG,
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: COOKIE_OPTIONS,
    },
    csrfToken: {
      name: csrfOptions.cookie.name,
      options: csrfOptions.cookie.options,
    },
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        csrfToken: { label: "CSRF Token", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password || !credentials?.csrfToken) {
          throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
        }

        const ip = req.headers['x-forwarded-for'] || 'anonymous';
        const userAgent = req.headers['user-agent'];
        
        try {
          // Check for breached password
          const isBreached = await SecurityService.checkPasswordBreached(credentials.password);
          if (isBreached) {
            await ActivityService.log('UNKNOWN', 'LOGIN_FAILED', {
              ip: ip as string,
              userAgent,
              metadata: { reason: 'breached_password' }
            });
            throw new Error('This password has been compromised in a data breach');
          }

          // Check rate limit
          await SecurityService.checkBruteForce(ip as string, 'login');

          // Validate CSRF token
          const storedToken = req.cookies[csrfOptions.cookie.name];
          if (!validateCSRFToken(credentials.csrfToken, storedToken)) {
            await ActivityService.log('UNKNOWN', 'LOGIN_FAILED', {
              ip: ip as string,
              userAgent,
              metadata: { reason: 'invalid_csrf' }
            });
            throw new Error(AUTH_ERRORS.INVALID_CSRF);
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              password: true,
              name: true,
              role: true,
            },
          });

          if (!user || !user.password) {
            await ActivityService.log('UNKNOWN', 'LOGIN_FAILED', {
              ip: ip as string,
              userAgent,
              metadata: { reason: 'user_not_found' }
            });
            await SecurityService.recordFailedAttempt(ip as string, 'login');
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
          }

          const isPasswordValid = await SecurityService.verifyPassword(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            await ActivityService.log(user.id, 'LOGIN_FAILED', {
              ip: ip as string,
              userAgent,
              metadata: { reason: 'invalid_password' }
            });
            await SecurityService.recordFailedAttempt(ip as string, 'login');
            throw new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
          }

          // Log successful login
          await ActivityService.log(user.id, 'LOGIN_SUCCESS', {
            ip: ip as string,
            userAgent
          });

          // Reset failed attempts on successful login
          await SecurityService.resetAttempts(ip as string, 'login');

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRole,
          };
        } catch (error) {
          if (error instanceof Error) {
            throw error;
          }
          throw new Error(AUTH_ERRORS.UNKNOWN);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Skip 2FA for OAuth providers
      if (account?.provider !== 'credentials') {
        return true;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { 
          twoFactorEnabled: true,
          twoFactorSecret: true,
          emailVerified: true,
        },
      });

      if (!dbUser?.emailVerified) {
        throw new Error(AUTH_ERRORS.EMAIL_NOT_VERIFIED);
      }

      // If 2FA is not enabled, allow sign in
      if (!dbUser.twoFactorEnabled) {
        return true;
      }

      // For 2FA users, verify the token
      const { totpToken } = account as any;
      if (!totpToken || !dbUser.twoFactorSecret) {
        return '/auth/2fa';
      }

      return verifyTOTP(totpToken, dbUser.twoFactorSecret);
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
