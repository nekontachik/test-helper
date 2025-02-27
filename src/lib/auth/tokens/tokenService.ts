import { sign, verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { SecurityError } from '@/lib/errors';
import logger from '@/lib/logger';
import { TokenType } from '@/types/token';

export interface TokenPayload {
  type: TokenType;
  userId: string;
  email: string;
  expiresIn?: string;
  sessionId?: string;
  [key: string]: unknown;
}

export class TokenService {
  private static readonly SECRET = process.env.JWT_SECRET || 'default-secret-key';
  private static readonly EXPIRES_IN = '24h';
  
  // In-memory blacklist for development purposes
  private static readonly tokenBlacklist = new Set<string>();

  static async generateToken(
    userId: string, 
    email: string, 
    role: string,
    sessionId?: string
  ): Promise<string> {
    try {
      const payload: TokenPayload = { 
        type: TokenType.ACCESS,
        userId, 
        email, 
        role,
        ...(sessionId && { sessionId })
      };
      return sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
    } catch (error) {
      logger.error('Token generation failed', { error, userId });
      throw new SecurityError('Failed to generate authentication token');
    }
  }

  static verifyToken(token: string): TokenPayload {
    try {
      // Check if token is blacklisted
      if (this.tokenBlacklist.has(token)) {
        throw new SecurityError('Token has been revoked');
      }
      
      return verify(token, this.SECRET) as TokenPayload;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new SecurityError('Token has expired');
      }
      if (error instanceof JsonWebTokenError) {
        throw new SecurityError('Invalid token');
      }
      throw new SecurityError('Token verification failed');
    }
  }

  static async invalidateToken(token: string, userId: string): Promise<void> {
    try {
      // Add to in-memory blacklist
      this.tokenBlacklist.add(token);
      logger.info('Token invalidated', { userId });
    } catch (error) {
      logger.error('Token invalidation failed', { error, userId });
      throw new SecurityError('Failed to invalidate token');
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.tokenBlacklist.has(token);
  }
}

// Re-export TokenType from the types file
export { TokenType };