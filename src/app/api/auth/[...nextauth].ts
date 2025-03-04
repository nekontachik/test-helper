import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { UserRole, AccountStatus, Permission } from '@/types/auth';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { Prisma } from '@prisma/client';

// Define custom user type for our application
interface CustomUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

// Define user select fields for consistent querying
const userSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  status: true,
  image: true,
  emailVerified: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
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
} satisfies Prisma.UserSelect;

// Define a custom session user type
interface CustomSessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  // Configure session handling
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },

  // Configure providers
  providers: [
    // OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    
    // Credentials Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const headers = req.headers as Record<string, string | undefined>;
        const ip = headers['x-forwarded-for'] || 'unknown';
        const userAgent = headers['user-agent'] || '';

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: userSelect
        });

        if (!user || !user.password) {
          await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
            ip,
            userAgent,
            metadata: {
              reason: 'user_not_found',
              email: credentials.email
            }
          });
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          await ActivityService.log(user.id, ActivityEventType.LOGIN_FAILED, {
            ip,
            userAgent,
            metadata: {
              reason: 'invalid_password'
            }
          });
          return null;
        }

        if (user.status !== 'ACTIVE') {
          await ActivityService.log(user.id, ActivityEventType.LOGIN_FAILED, {
            ip,
            userAgent,
            metadata: {
              reason: 'account_inactive',
              status: user.status
            }
          });
          return null;
        }

        const permissions: Permission[] = user.userPermissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description
        }));

        await ActivityService.log(user.id, ActivityEventType.LOGIN_SUCCESS, {
            ip,
            userAgent,
            metadata: {
              provider: 'credentials',
              email: user.email
            }
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          permissions,
          status: user.status as AccountStatus,
          emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(user.twoFactorEnabled),
          twoFactorAuthenticated: false,
          emailVerified: user.emailVerified
        };
      }
    })
  ],

  // Configure callbacks
  callbacks: {
    async signIn({ user, account }) {
      // Skip email verification for OAuth
      if (account?.provider !== 'credentials') {
        return true;
      }

      // Check email verification
      if (!user.emailVerified) {
        return '/auth/verify-email';
      }

      // Handle 2FA
      if (user.twoFactorEnabled && !user.twoFactorAuthenticated) {
        return '/auth/2fa';
      }

      return true;
    },
    async jwt({ token, user }): Promise<JWT> {
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
    async session({ session, token }) {
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
  },

  // Configure pages
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  // Security options
  secret: process.env.NEXTAUTH_SECRET || '',
  debug: process.env.NODE_ENV === 'development'
};

// Export handler
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
