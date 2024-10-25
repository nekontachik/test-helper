import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';
import type { RequestInternal } from 'next-auth';
import type { Prisma } from '@prisma/client';

// Extend the User type to include our custom fields
interface CustomUser extends User {
  role: UserRole;
  emailVerified?: Date | null;
}

// Define select fields for better reusability and performance
const userSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
} satisfies Prisma.UserSelect;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined,
        req: Pick<RequestInternal, "body" | "query" | "headers" | "method">
      ): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Use a single database query with specific field selection
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: userSelect
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Remove sensitive data before returning
        const { password: _, ...userWithoutPassword } = user;

        return {
          ...userWithoutPassword,
          role: user.role as UserRole,
          image: null // Required by User type
        };
      }
    })
  ],
  session: {
    strategy: 'jwt',
    // Optimize session duration
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Only update token if new user data is provided
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      // Type assertion to avoid unnecessary checks
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  // Add security options
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};

// Use constant for handler to enable better caching
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
