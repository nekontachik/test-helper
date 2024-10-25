export const UserRoles = {
  USER: 'USER',
  TESTER: 'TESTER',
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER'
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];

export function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRoles).includes(role as UserRole);
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: Date;
  image?: string;
}

declare module "next-auth" {
  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    id: string;
  }
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: UserRole;
}
