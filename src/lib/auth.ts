import type { NextAuthOptions, DefaultSession as _DefaultSession, Session } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import type { UserRole, AccountStatus} from '@/types/auth';
import { Permission as _Permission } from '@/types/auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import type { User } from 'next-auth';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, _req): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            image: true,
            role: true,
            status: true,
            emailVerified: true,
            twoFactorEnabled: true
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          status: user.status as AccountStatus,
          emailVerified: user.emailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorAuthenticated: false,
          permissions: [],
          emailNotificationsEnabled: true
        };
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.twoFactorEnabled = user.twoFactorEnabled;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      const user = {
        ...session.user,
        status: token.status as AccountStatus,
        permissions: [],
        emailNotificationsEnabled: true
      } as Session["user"];
      if (session.user) {
        user.id = token.id as string;
        user.role = token.role as UserRole;
        user.twoFactorEnabled = Boolean(token.twoFactorEnabled);
        user.emailVerified = token.emailVerified as Date | null;
        session.user = user;
      }
      return session;
    }
  }
};
