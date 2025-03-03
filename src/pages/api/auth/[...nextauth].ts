import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { logger } from '@/lib/logger';

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

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
          return { id: user.id, email: user.email, name: user.name };
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
    secret: process.env.JWT_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || 'user';
        token.email = user.email;
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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.expires = new Date(token.exp as number * 1000).toISOString();
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development',
}); 