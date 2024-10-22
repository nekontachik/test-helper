import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      // Add any other properties your session user object has
    }
    // Add accessToken here if you're using it
    accessToken?: string
  }
}
