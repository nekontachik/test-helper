'use client';

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthService } from '@/lib/services/auth.service';
import type { UserRole } from '@/types/auth';
import { logger } from '@/lib/utils/clientLogger';

// Extend Next Auth types with our custom fields
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string | null;
    image: string | null;
  }
}

// Add role to JWT
declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      // @ts-expect-error - NextAuth types are complex, but this works correctly
      async authorize(credentials) {
        logger.info('Starting authorize function', { 
          hasCredentials: !!credentials,
          credentialKeys: credentials ? Object.keys(credentials) : []
        });
        
        if (!credentials?.email || !credentials?.password) {
          logger.warn('Auth attempt with missing credentials', {
            hasEmail: !!credentials?.email,
            hasPassword: !!credentials?.password
          });
          return null;
        }
        
        try {
          logger.debug('Validating credentials', { 
            email: credentials.email,
            passwordLength: credentials.password.length
          });
          
          const user = await AuthService.validateCredentials(credentials.email, credentials.password);
          
          logger.info('Validation result', { 
            hasUser: !!user, 
            email: credentials.email,
            userFields: user ? Object.keys(user) : []
          });
          
          if (!user) {
            logger.warn('Invalid credentials', { email: credentials.email });
            return null;
          }
          
          // Return the user object that matches our NextAuth User interface
          const authUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            image: user.image
          };
          
          logger.info('User authenticated successfully', { 
            userId: authUser.id, 
            role: authUser.role,
            authUserFields: Object.keys(authUser)
          });
          return authUser;
        } catch (error) {
          logger.error('Authentication error', { 
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            email: credentials.email,
            errorType: error?.constructor?.name || typeof error
          });
          return null;
        }
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-do-not-use-in-production',
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If the URL is relative, prepend the base URL
      if (url.startsWith('/')) {
        logger.debug('NextAuth redirect - relative URL', { url, baseUrl });
        return `${baseUrl}${url}`;
      }
      
      // If the URL is already absolute and on the same origin, allow it
      if (url.startsWith(baseUrl)) {
        logger.debug('NextAuth redirect - same origin URL', { url, baseUrl });
        return url;
      }
      
      // Default to the dashboard
      logger.debug('NextAuth redirect - defaulting to dashboard', { url, baseUrl });
      return `${baseUrl}/dashboard`;
    },
    async session({ session, token }) {
      logger.info('Session callback', { 
        hasSession: !!session, 
        hasToken: !!token,
        tokenKeys: token ? Object.keys(token) : [],
        sessionUserKeys: session?.user ? Object.keys(session.user) : []
      });
      
      if (token) {
        // Add properties to the session user
        session.user = {
          ...session.user,
          id: token.sub!,
          role: token.role
        };
        
        logger.info('Session updated', { 
          sessionUser: session.user,
          sessionUserKeys: Object.keys(session.user)
        });
      }
      return session;
    },
    async jwt({ token, user }) {
      logger.info('JWT callback', { 
        hasToken: !!token, 
        hasUser: !!user,
        tokenKeys: token ? Object.keys(token) : [],
        userKeys: user ? Object.keys(user) : []
      });
      
      if (user) {
        token.role = user.role;
        logger.info('JWT updated with user data', { 
          tokenRole: token.role,
          userRole: user.role
        });
      }
      return token;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  debug: process.env.NODE_ENV === 'development',
  // Enable secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production'
};
