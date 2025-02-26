import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "@/lib/prisma"
import type { UserRole, AccountStatus, Permission } from "@/types/auth"
import type { Session, User } from "next-auth"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const dbUser = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { 
            id: true, 
            email: true, 
            name: true, 
            password: true, 
            role: true,
            image: true,
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
        })

        if (!dbUser || !dbUser.password) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, dbUser.password)

        if (!isPasswordValid) {
          return null
        }

        const permissions: Permission[] = dbUser.userPermissions.map(up => ({
          id: up.permission.id,
          name: up.permission.name,
          description: up.permission.description
        }))

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          image: dbUser.image,
          role: dbUser.role as UserRole,
          permissions: permissions,
          status: dbUser.status as AccountStatus,
          emailNotificationsEnabled: Boolean(dbUser.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(dbUser.twoFactorEnabled),
          twoFactorAuthenticated: false,
          emailVerified: dbUser.emailVerified
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id as string,
          role: user.role as UserRole,
          permissions: user.permissions as Permission[],
          status: user.status as AccountStatus,
          emailNotificationsEnabled: Boolean(user.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(user.twoFactorEnabled),
          twoFactorAuthenticated: Boolean(user.twoFactorAuthenticated)
        }
      }
      return token
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        const sessionUser = {
          ...session.user,
          id: token.id as string,
          role: token.role as UserRole,
          permissions: token.permissions as Permission[],
          status: token.status as AccountStatus,
          emailNotificationsEnabled: Boolean(token.emailNotificationsEnabled),
          twoFactorEnabled: Boolean(token.twoFactorEnabled),
          twoFactorAuthenticated: Boolean(token.twoFactorAuthenticated)
        }
        
        session.user = sessionUser
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error'
  }
}
