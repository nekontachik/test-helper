import NextAuth, { DefaultSession } from "next-auth"
import { UserRole, AccountStatus, Permission } from '@/types/auth';

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
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
    }
  }

  interface User {
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
  }

  interface DefaultUser {
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
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id: string;
    email: string | null;
    name: string | null;
    picture?: string | null;
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

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    email: string | null;
    name: string | null;
    picture?: string | null;
    role: UserRole;
    permissions: Permission[];
    status: AccountStatus;
    emailNotificationsEnabled: boolean;
    twoFactorEnabled: boolean;
    twoFactorAuthenticated: boolean;
    emailVerified: Date | null;
  }
}

declare module "@auth/core/types" {
  interface User extends DefaultUser {}
  interface Session extends DefaultSession {
    user: User;
  }
}

export {}
