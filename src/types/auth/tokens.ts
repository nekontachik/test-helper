/**
 * @file Token-related type definitions
 * 
 * Defines the token types and interfaces for authentication.
 */

import type { UserRole } from './roles';

/**
 * Token types used in the application
 */
export enum TokenType {
  ACCESS = 'ACCESS',
  REFRESH = 'REFRESH',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  INVITATION = 'INVITATION',
  TWO_FACTOR = 'TWO_FACTOR'
}

/**
 * Base token payload interface
 */
export interface BaseTokenPayload {
  jti: string; // JWT ID
  iat: number; // Issued at
  exp: number; // Expiration time
  sub: string; // Subject (usually user ID)
  type: TokenType; // Token type
}

/**
 * Access token payload
 */
export interface AccessTokenPayload extends BaseTokenPayload {
  type: TokenType.ACCESS;
  email: string;
  role: UserRole;
  sessionId: string;
}

/**
 * Refresh token payload
 */
export interface RefreshTokenPayload extends BaseTokenPayload {
  type: TokenType.REFRESH;
  sessionId: string;
}

/**
 * Email verification token payload
 */
export interface EmailVerificationTokenPayload extends BaseTokenPayload {
  type: TokenType.EMAIL_VERIFICATION;
  email: string;
}

/**
 * Password reset token payload
 */
export interface PasswordResetTokenPayload extends BaseTokenPayload {
  type: TokenType.PASSWORD_RESET;
  email: string;
}

/**
 * Invitation token payload
 */
export interface InvitationTokenPayload extends BaseTokenPayload {
  type: TokenType.INVITATION;
  email: string;
  role: UserRole;
  invitedBy: string;
}

/**
 * Two-factor authentication token payload
 */
export interface TwoFactorTokenPayload extends BaseTokenPayload {
  type: TokenType.TWO_FACTOR;
  email: string;
  code: string;
}

/**
 * Union type of all token payloads
 */
export type TokenPayload =
  | AccessTokenPayload
  | RefreshTokenPayload
  | EmailVerificationTokenPayload
  | PasswordResetTokenPayload
  | InvitationTokenPayload
  | TwoFactorTokenPayload;

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

/**
 * Verification token stored in the database
 */
export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

/**
 * Backup codes for two-factor authentication
 */
export interface BackupCodes {
  codes: string[];
  updatedAt: Date;
} 