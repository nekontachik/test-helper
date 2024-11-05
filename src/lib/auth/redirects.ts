import { NextAuthOptions } from "next-auth"
import { getURL } from "@/lib/utils"

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
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic = isPublicPage(nextUrl.pathname)

      if (isPublic) {
        // Redirect logged in users from auth pages to default redirect
        if (isLoggedIn) {
          return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return true
      }

      // Redirect unauthenticated users to login page
      if (!isLoggedIn) {
        let callbackUrl = nextUrl.pathname
        if (nextUrl.search) {
          callbackUrl += nextUrl.search
        }
        
        const encodedCallbackUrl = encodeURIComponent(callbackUrl)
        return Response.redirect(
          new URL(`/auth/signin?callbackUrl=${encodedCallbackUrl}`, nextUrl)
        )
      }

      return true
    },
  },
} 