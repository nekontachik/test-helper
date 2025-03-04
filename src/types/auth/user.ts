/**
 * @file User-related type definitions
 * 
 * Defines the user types and interfaces for authentication and user management.
 */

import type { UserRole, AccountStatus } from './roles';
import type { Permission } from './permissions';

/**
 * Complete user model as stored in the database
 */
export interface User {
  id: string;
  email: string;
  name?: string | null;
  password: string; // Hashed password
  role: UserRole;
  status: AccountStatus;
  emailVerified: Date | null;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

/**
 * User data for authentication purposes
 * Excludes sensitive information like password
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
}

/**
 * User data for registration
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

/**
 * Extended user information for session data
 */
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: UserRole;
  status: AccountStatus;
  permissions: Permission[];
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  emailNotificationsEnabled: boolean;
  twoFactorAuthenticated: boolean;
}

/**
 * Public user profile information
 * Safe to expose to other users
 */
export interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
}

/**
 * User with security-related information
 * For internal security operations
 */
export interface UserSecurityInfo {
  id: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  failedLoginAttempts: number;
  emailVerified: Date | null;
  twoFactorEnabled: boolean;
} 