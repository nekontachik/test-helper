// Re-export everything from central types
export * from '@/types/auth';

export const UserRole = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TESTER: 'TESTER',
  VIEWER: 'VIEWER',
  USER: 'USER'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export function validateUserRole(role: unknown): UserRole {
  if (isValidUserRole(role)) return role;
  return UserRole.USER; // Default fallback
}

export function isValidUserRole(role: unknown): role is UserRole {
  return typeof role === 'string' && Object.values(UserRole).includes(role as UserRole);
}

// Remove the module augmentation since it's causing conflicts
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
}

// Use these types instead of module augmentation
export type { AuthUser as User, AuthSession as Session };