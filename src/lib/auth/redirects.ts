import { NextAuthOptions } from "next-auth"
import { getURL } from "@/lib/utils"
import { UserRole } from "@/types/rbac"
import type { JWT } from "next-auth/jwt"
import type { Session } from "next-auth"

interface ExtendedUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

interface ExtendedSession extends Session {
  user: ExtendedUser;
}

interface ExtendedToken extends JWT {
  role: UserRole;
  email: string | null;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

interface UserWithAuth {
  id: string;
  email: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

// Pages that don't require authentication
export const publicPages = [
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/auth/verify",
]

// Default redirect after login if no callbackUrl is provided
export const DEFAULT_LOGIN_REDIRECT = "/dashboard"

export function isPublicPage(path: string): boolean {
  return publicPages.some(page => path.startsWith(page))
}

export const authConfig: Partial<NextAuthOptions> = {
  pages: {
    signIn: getURL("/auth/signin"),
    error: getURL("/auth/error"),
    verifyRequest: getURL("/auth/verify"),
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }): Promise<ExtendedToken> {
      if (user) {
        const authUser = user as UserWithAuth;
        return {
          ...token,
          email: authUser.email,
          role: authUser.role,
          twoFactorEnabled: authUser.twoFactorEnabled,
          twoFactorAuthenticated: authUser.twoFactorAuthenticated,
          emailVerified: authUser.emailVerified,
        };
      }
      return token as ExtendedToken;
    },
    async session({ session, token }): Promise<ExtendedSession> {
      const extendedToken = token as ExtendedToken;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub!,
          role: extendedToken.role,
          twoFactorEnabled: extendedToken.twoFactorEnabled,
          twoFactorAuthenticated: extendedToken.twoFactorAuthenticated,
          emailVerified: extendedToken.emailVerified,
        } as ExtendedUser,
      };
    },
  },
} 