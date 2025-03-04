// Re-export everything from central types
export * from '@/types/auth';

// Import UserRole as a value, not just a type
import { UserRole } from '@/types/auth';
import { isValidUserRole } from '@/lib/utils/typeGuards';

// Use UserRole enum values instead of string literals
export const UserRoleValues = {
  ADMIN: UserRole.ADMIN,
  PROJECT_MANAGER: UserRole.PROJECT_MANAGER,
  TESTER: UserRole.TESTER,
  VIEWER: UserRole.VIEWER,
  USER: UserRole.USER
} as const;

export function validateUserRole(role: unknown): UserRole {
  if (isValidUserRole(role)) return role;
  return UserRole.USER; // Use enum value instead of string literal
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