import { UserRole } from './rbac';
import { AuditAction } from './audit';

export { UserRole };

// Define account status type
export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface User {
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

export interface AuthUser extends User {
  permissions: string[];
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  expiresAt: number;
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

export interface EmailVerificationToken {
  value: string;
  expiresAt: Date;
}

export interface EmailVerificationData {
  userId: string;
  type: 'email_verification';
  action: AuditAction;
  metadata: {
    event: string;
    email: string;
    error?: string;
  };
}
