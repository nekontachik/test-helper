import type { Session } from 'next-auth';

// Define user roles
export type UserRole = 
  | 'ADMIN' 
  | 'PROJECT_MANAGER' 
  | 'TESTER' 
  | 'VIEWER'
  | 'USER'; // Add this to match schema default

// Define account status type
export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  DELETED = 'DELETED'
}

export type AuthStatus = 'authenticated' | 'unauthenticated' | 'loading';

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

export interface AuthUser {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  permissions: Permission[];
  status: AccountStatus;
  emailNotificationsEnabled: boolean;
  twoFactorEnabled: boolean;
  twoFactorAuthenticated: boolean;
  emailVerified: Date | null;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
}

export interface ExtendedSession extends Session {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    image: string | null;
    role: UserRole;
    status: AccountStatus;
    permissions: Permission[];
    twoFactorEnabled: boolean;
    emailVerified: Date | null;
    emailNotificationsEnabled: boolean;
    twoFactorAuthenticated: boolean;
  };
}

// Type guard
export function isExtendedSession(session: Session): session is ExtendedSession {
  return 'role' in session.user && 'permissions' in session.user;
}

export interface TokenPayload {
  type: string;
  email: string;
  userId: string;
  expiresIn?: string;
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

export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export enum AuditAction {
  EMAIL_VERIFICATION_REQUESTED = 'EMAIL_VERIFICATION_REQUESTED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  EMAIL_VERIFICATION_FAILED = 'EMAIL_VERIFICATION_FAILED'
}
