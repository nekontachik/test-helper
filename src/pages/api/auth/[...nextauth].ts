import NextAuth from 'next-auth';
import type { User, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { logger } from '@/lib/logger';
import type { UserRole } from '@/types/auth';

// Define the user type that matches your database schema
interface DbUser {
  id: string;
  email: string;
  name: string | null;
  role?: string;
  password: string;
  twoFactorEnabled?: boolean;
  twoFactorAuthenticated?: boolean;
  emailVerified?: Date | null;
}

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          }) as DbUser | null;

          if (!user) {
            logger.warn('Login attempt with non-existent email', { email: credentials.email });
            return null;
          }

          const isValid = await verifyPassword(credentials.password, user.password);
          
          if (!isValid) {
            logger.warn('Failed login attempt', { email: credentials.email });
            return null;
          }

          logger.info('User logged in successfully', { userId: user.id });
          
          // Return user object that matches the User interface in next-auth.d.ts
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: null,
            role: (user.role || 'USER') as UserRole,
            twoFactorEnabled: user.twoFactorEnabled || false,
            twoFactorAuthenticated: user.twoFactorAuthenticated || false,
            emailVerified: user.emailVerified || null
          } as User;
        } catch (error) {
          logger.error('Error during authentication', { error });
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-jwt-secret',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.email = user.email;
        token.twoFactorEnabled = user.twoFactorEnabled || false;
        token.twoFactorAuthenticated = user.twoFactorAuthenticated || false;
        token.emailVerified = user.emailVerified ? user.emailVerified.toISOString() : null;
      }
      
      const tokenExpiration = new Date((token.exp as number) * 1000);
      const now = new Date();
      const timeRemaining = tokenExpiration.getTime() - now.getTime();
      
      if (timeRemaining < 24 * 60 * 60 * 1000) {
        logger.info('Session nearing expiration', { 
          userId: token.id, 
          expiresIn: Math.floor(timeRemaining / 1000 / 60) + ' minutes'
        });
      }
      
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        // Create a new session object with the correct types
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            id: token.id as string,
            role: token.role as UserRole,
            // Add the missing properties
            twoFactorEnabled: Boolean(token.twoFactorEnabled),
            twoFactorAuthenticated: Boolean(token.twoFactorAuthenticated),
            // Handle emailVerified specially
            emailVerified: token.emailVerified ? new Date(token.emailVerified as string) : null
          },
          expires: new Date(token.exp as number * 1000).toISOString()
        };
        
        // Return the updated session
        return updatedSession as Session;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}); 