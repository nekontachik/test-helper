import NextAuth, { DefaultSession } from "next-auth"
import { UserRole, AccountStatus, Permission } from '@/types/auth';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string | null;
      name: string | null;
      image: string | null;
      role: UserRole;
      status: AccountStatus;
      twoFactorEnabled: boolean;
      twoFactorAuthenticated: boolean;
      permissions: Permission[];
      emailNotificationsEnabled: boolean;
      emailVerified: Date | null;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    status: AccountStatus;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    permissions: Permission[];
    emailNotificationsEnabled: boolean;
    emailVerified: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    permissions: Permission[];
    status: AccountStatus;
    emailNotificationsEnabled: boolean;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    emailVerified: Date | null;
    sub?: string;
    iat?: number;
    exp?: number;
    jti?: string;
  }
}

export {}
