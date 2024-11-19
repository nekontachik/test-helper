import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { UserRole, AccountStatus, Permission } from '@/types/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import type { NextAuthOptions, User, Session, DefaultSession, JWT } from 'next-auth';
import type { Prisma } from '@prisma/client';
import type { IncomingHttpHeaders } from 'http';
import type { RequestInternal } from 'next-auth';

// Define activity event types that match ActivityService
const AUTH_EVENTS = {
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_2FA_FAILED: 'AUTH_2FA_FAILED',
  AUTH_2FA_SUCCESS: 'AUTH_2FA_SUCCESS'
} as const;

type AuthEventType = typeof AUTH_EVENTS[keyof typeof AUTH_EVENTS];

// Define CSRF validation types
interface CSRFValidationResult {
  valid: boolean;
  error?: string;
}

// Define extended request type
interface ExtendedRequest {
  cookies: { [key: string]: string };
  headers: IncomingHttpHeaders;
}

// CSRF validation helper
const validateToken = (token: string, storedToken?: string): CSRFValidationResult => {
  if (!storedToken) {
    return { valid: false, error: 'No stored CSRF token' };
  }
  return { valid: token === storedToken };
};

// Add type for security check types
type SecurityCheckType = 'login' | 'password';

// Define local auth errors
const AUTH_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  SESSION_REQUIRED: 'Authentication required',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_CSRF: 'Invalid CSRF token',
  ACCOUNT_LOCKED: 'Account is locked',
  ACCOUNT_SUSPENDED: 'Account is suspended',
  INVALID_2FA_CODE: 'Invalid 2FA code',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  UNKNOWN: 'An unexpected error occurred'
} as const;

// Find and validate user
const userSelect = {
  id: true,
  email: true,
  password: true,
  name: true,
  role: true,
  image: true,
  status: true,
  twoFactorEnabled: true,
  twoFactorSecret: true,
  emailVerified: true,
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

// Define custom user type that includes permissions
interface CustomUser {
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

// Extend the built-in session type
interface ExtendedSession extends Session {
  user: {
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
  } & DefaultSession["user"]
}

// Extend the built-in JWT type
interface ExtendedJWT extends JWT {
  id: string;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60
  },
  providers: [
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
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req: Pick<RequestInternal, "body" | "query" | "headers" | "method">
      ): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: userSelect
        });

        if (!user || !user.password) {
          await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
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
            metadata: {
              reason: 'invalid_password'
            }
          });
          return null;
        }

        const permissions = user.userPermissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description
        }));

        await ActivityService.log(user.id, ActivityEventType.LOGIN_SUCCESS, {
          metadata: {
            provider: 'credentials'
          }
        });

        // Return type that matches next-auth User
        return {
          id: user.id,
          email: user.email!, // Assert email is not null
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          permissions: permissions,
          status: user.status as AccountStatus,
          emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(user.twoFactorEnabled),
          twoFactorAuthenticated: false,
          emailVerified: user.emailVerified
        } satisfies User;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }): Promise<boolean | string> {
      if (account?.provider !== 'credentials') {
        return true;
      }

      if (!user.emailVerified) {
        return '/auth/verify-email';
      }

      if (user.twoFactorEnabled && !user.twoFactorAuthenticated) {
        return '/auth/2fa';
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // Explicitly type the return value
        const jwtToken: JWT = {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          status: user.status,
          emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(user.twoFactorEnabled),
          twoFactorAuthenticated: Boolean(user.twoFactorAuthenticated),
          emailVerified: user.emailVerified
        };
        return jwtToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Explicitly type the session user
        session.user = {
          ...session.user,
          id: token.id,
          email: token.email,
          name: token.name,
          role: token.role as UserRole,
          permissions: token.permissions,
          status: token.status as AccountStatus,
          emailNotificationsEnabled: Boolean(token.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(token.twoFactorEnabled),
          twoFactorAuthenticated: Boolean(token.twoFactorAuthenticated),
          emailVerified: token.emailVerified
        };
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
