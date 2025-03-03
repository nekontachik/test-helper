// Import NextAuth types
import 'next-auth';

// Define user roles
export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  EDITOR = 'EDITOR',
  TESTER = 'TESTER',
  VIEWER = 'VIEWER',
  USER = 'USER'
}

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
  email: string;
  name?: string;
  role: UserRole;
  emailVerified?: Date | null;
  twoFactorAuthenticated?: boolean;
}

export interface AuthResult {
  user: AuthUser;
  token: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
}

// Custom session type that extends the base Session
export interface ExtendedSession {
  user: {
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
  };
  expires: string;
}

// Type guard
export function isExtendedSession(session: unknown): session is ExtendedSession {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;
  return 'user' in s && typeof s.user === 'object' && s.user !== null && 
         'role' in (s.user as Record<string, unknown>) && 
         'permissions' in (s.user as Record<string, unknown>);
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

// Define custom properties for NextAuth
export interface CustomUser {
  id: string;
  role: UserRole;
  emailVerified: string | null;
  twoFactorAuthenticated: boolean;
}

// Add back the AuthTokens interface
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
