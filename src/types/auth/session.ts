/**
 * @file Session-related type definitions
 * 
 * Defines the session types and interfaces for authentication.
 */

import type { SessionUser } from './user';

/**
 * Extended session with user information
 */
export interface ExtendedSession {
  user: SessionUser;
  expires: string;
}

/**
 * Authentication result returned after successful login
 */
export interface AuthResult {
  user: SessionUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  sessionId: string;
  twoFactorRequired: boolean;
}

/**
 * Authentication context for requests
 */
export interface AuthContext {
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

/**
 * Type guard to check if a session is an ExtendedSession
 */
export function isExtendedSession(session: unknown): session is ExtendedSession {
  if (!session || typeof session !== 'object') return false;
  const s = session as Record<string, unknown>;
  return 'user' in s && typeof s.user === 'object' && s.user !== null && 
         'role' in (s.user as Record<string, unknown>) && 
         'permissions' in (s.user as Record<string, unknown>);
} 