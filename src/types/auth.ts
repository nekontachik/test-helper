import { UserRole } from './rbac';
import { AuditAction } from './audit';

export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  twoFactorAuthenticated: boolean;
  status: AccountStatus;
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
