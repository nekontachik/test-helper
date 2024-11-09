import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { UserRole } from '@/types/auth';
import type { RequestInternal } from 'next-auth';

interface CustomUser extends User {
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

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
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: null,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorAuthenticated: false,
          emailVerified: user.emailVerified,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.twoFactorAuthenticated = user.twoFactorAuthenticated;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as UserRole;
        session.user.twoFactorEnabled = token.twoFactorEnabled as boolean;
        session.user.twoFactorAuthenticated = token.twoFactorAuthenticated as boolean;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    }
  }
};

export default NextAuth(authOptions);
