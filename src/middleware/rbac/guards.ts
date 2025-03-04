import type { ExtendedAccessTokenPayload, AuthResult, AuthErrorResult } from './types';

/**
 * Type guard for AccessTokenPayload
 * Validates that a token has the required properties
 */
export function isAccessTokenPayload(token: unknown): token is ExtendedAccessTokenPayload {
  return Boolean(
    token && 
    typeof token === 'object' && 
    'sub' in token && 
    'email' in token && 
    'role' in token
  );
}

/**
 * Check if a result is an authentication error
 * Used to determine if authentication failed
 */
export function isAuthError(result: AuthResult | AuthErrorResult): result is AuthErrorResult {
  return 'response' in result;
} 