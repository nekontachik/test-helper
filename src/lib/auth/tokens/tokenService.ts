import { prisma } from '@/lib/prisma';
import { sign, verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { SecurityError } from '@/lib/errors';
import type { Prisma } from '@prisma/client';
import logger from '@/lib/logger';
import { TokenType, TOKEN_CONFIG } from '@/types/token';

export interface TokenPayload {
  type: TokenType;
  userId: string;
  email: string;
  expiresIn?: string;
  [key: string]: unknown;
}

export class TokenService {
  private static readonly SECRET = process.env.JWT_SECRET!;

  static async generateToken(payload: TokenPayload): Promise<string> {
    const config = TOKEN_CONFIG[payload.type];
    return sign(payload, this.SECRET, {
      expiresIn: config.expiresIn
    });
  }

  static async verifyToken(token: string, type: TokenType): Promise<TokenPayload | null> {
    try {
      const payload = verify(token, this.SECRET) as TokenPayload;
      if (payload.type !== type) {
        return null;
      }

      // Check if token has been revoked
      const isRevoked = await prisma.token.findFirst({
        where: {
          token,
          revoked: true
        }
      });

      if (isRevoked) {
        return null;
      }

      return payload;
    } catch (error) {
      if (error instanceof JsonWebTokenError || error instanceof TokenExpiredError) {
        logger.warn('Token verification failed:', error);
        return null;
      }
      throw error;
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
      const where: Prisma.TokenWhereInput = {
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