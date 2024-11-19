import type { UserRole } from '@/types/rbac';
import type { Permission as RBACPermission } from '@/types/rbac';

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  permissions: RBACPermission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

export interface Session {
  user: AuthUser;
  expires: string;
}

export interface TokenPayload {
  type: string;
  email: string;
  userId: string;
  expiresIn?: string;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface BackupCodes {
  codes: string[];
  updatedAt: Date;
}

export interface AuthConfig {
  maxSessions: number;
  sessionDuration: number;
  refreshTokenDuration: number;
  twoFactorTimeout: number;
}

export interface AuthContext {
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export interface AuthError {
  code: string;
  message: string;
  status: number;
}

// Export UserRole directly instead of aliasing
export { UserRole };
export type { RBACPermission as Permission };