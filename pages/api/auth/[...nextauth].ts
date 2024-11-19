import NextAuth, { NextAuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcrypt';
import { UserRole, AccountStatus, Permission } from '@/types/auth';
import type { JWT } from 'next-auth/jwt';

// Define a type that extends User from next-auth
type CustomUser = User & {
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
};

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req): Promise<User | null> {
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
            status: true,
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
          }
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        const permissions = user.userPermissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description
        }));

        // Return the user with the correct type
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: null,
          role: user.role as UserRole,
          permissions,
          status: user.status as AccountStatus,
          emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorAuthenticated: false,
          emailVerified: user.emailVerified
        } as CustomUser;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as CustomUser;
        const jwtToken: JWT = {
          ...token,
          id: customUser.id,
          email: customUser.email,
          name: customUser.name,
          role: customUser.role,
          permissions: customUser.permissions,
          status: customUser.status,
          emailNotificationsEnabled: customUser.emailNotificationsEnabled,
          twoFactorEnabled: customUser.twoFactorEnabled,
          twoFactorAuthenticated: customUser.twoFactorAuthenticated,
          emailVerified: customUser.emailVerified
        };
        return jwtToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
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
  }
};

export default NextAuth(authOptions);
