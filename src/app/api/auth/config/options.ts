import type { NextAuthOptions } from 'next-auth';
import type { Adapter } from 'next-auth/adapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { providers } from './providers';
import { callbacks } from './callbacks';

/**
 * NextAuth configuration options
 */
export const authOptions: NextAuthOptions = {
  // Using type assertion to resolve compatibility issues between different versions
  adapter: PrismaAdapter(prisma) as unknown as Adapter,
  providers,
  callbacks,
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  debug: process.env.NODE_ENV === 'development',
}; 