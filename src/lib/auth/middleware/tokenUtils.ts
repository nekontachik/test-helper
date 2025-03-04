import jwt from 'jsonwebtoken';
import { logger } from '@/lib/logger';
import type { AuthToken } from './types';
import { config } from './config';

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token or null if invalid
 */
export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, config.auth.jwtSecret) as AuthToken;
    return decoded;
  } catch (error) {
    logger.warn('Token verification failed', { error });
    return null;
  }
}

/**
 * Extract token from request headers or cookies
 * @param req - Request object
 * @returns Token string or null if not found
 */
export function extractToken(req: {
  headers: { authorization?: string | undefined };
  cookies?: { token?: string };
}): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Check cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  
  return null;
}

/**
 * Check if a token is expired or about to expire
 * @param token - Decoded token
 * @param bufferSeconds - Buffer time in seconds before actual expiration
 * @returns Boolean indicating if token needs refresh
 */
export function isTokenExpiringSoon(token: AuthToken, bufferSeconds = 300): boolean {
  if (!token.exp) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  return token.exp - currentTime < bufferSeconds;
}

/**
 * Generate a new token with refreshed expiration
 * @param token - Original token data
 * @returns New token string
 */
export function refreshToken(token: AuthToken): string {
  const newToken = {
    ...token,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + config.auth.tokenExpirySeconds
  };
  
  return jwt.sign(newToken, config.auth.jwtSecret);
} 