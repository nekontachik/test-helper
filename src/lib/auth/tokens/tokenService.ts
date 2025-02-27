import { prisma } from '@/lib/prisma';
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
      await prisma.tokenBlacklist.create({
        data: {
          token,
          userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        }
      });
    } catch (error) {
      logger.error('Token invalidation failed', { error, userId });
      throw new SecurityError('Failed to invalidate token');
    }
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { token }
      });
      return !!blacklistedToken;
    } catch (error) {
      logger.error('Token blacklist check failed', { error });
      return true; // Fail safe - treat as blacklisted if check fails
    }
  }

  static async revokeToken(token: string, type: TokenType): Promise<void> {
    try {
      await prisma.token.update({
        where: { token },
        data: { 
          revoked: true,
          updatedAt: new Date()
        }
      });

      logger.info('Token revoked successfully', { type });
    } catch (error) {
      logger.error('Failed to revoke token:', error);
      throw new SecurityError('Failed to revoke token');
    }
  }

  static async invalidateAllUserTokens(userId: string, type?: TokenType): Promise<void> {
    try {
      const where: Record<string, unknown> = {
        userId,
        revoked: false,
        ...(type && { type })
      };

      await prisma.token.updateMany({
        where,
        data: { 
          revoked: true,
          updatedAt: new Date()
        }
      });

      logger.info('All user tokens invalidated', { userId, type });
    } catch (error) {
      logger.error('Failed to invalidate user tokens:', error);
      throw new SecurityError('Failed to invalidate tokens');
    }
  }
}

// Re-export TokenType from the types file
export { TokenType };