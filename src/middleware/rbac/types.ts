import type { AccessTokenPayload } from '@/types/auth/tokens';
import type { UserRole } from '@/types/auth/roles';

/**
 * Role-Based Access Control options
 */
export interface RBACOptions {
  roles?: UserRole[] | undefined;
  requireVerified?: boolean | undefined;
  require2FA?: boolean | undefined;
  permissions?: string[] | undefined;
}

/**
 * Extended AccessTokenPayload with optional security properties
 */
export interface ExtendedAccessTokenPayload extends AccessTokenPayload {
  emailVerified?: boolean;
  twoFactorAuthenticated?: boolean;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  token: ExtendedAccessTokenPayload;
  ip?: string;
  userAgent?: string;
}

/**
 * Authentication error result interface
 */
export interface AuthErrorResult {
  response: Response;
}

/**
 * Security context for logging
 */
export interface SecurityContext {
  path: string;
  ip: string;
  userAgent: string;
  [key: string]: unknown;
}

/**
 * User context for logging
 */
export interface UserContext extends SecurityContext {
  userId: string;
  email: string;
  role?: string;
} 