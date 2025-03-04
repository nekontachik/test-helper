import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import type { UserRole, AccountStatus, Permission } from '@/types/auth';
import { userSelect } from './userSelect';

/**
 * Configure authentication providers
 */
export const providers = [
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
]; 