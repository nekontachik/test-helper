import type { UserRole, AccountStatus, Permission } from '@/types/auth';

/**
 * Custom user type for our application
 */
export interface CustomUser {
  id: string;
  email: string;
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

/**
 * Custom session user type
 */
export interface CustomSessionUser {
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