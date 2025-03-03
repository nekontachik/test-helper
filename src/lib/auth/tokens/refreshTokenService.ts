import { sign, verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SecurityError } from '@/lib/errors';
import logger from '@/lib/logger';
import { TokenService } from './tokenService';
import { prisma } from '@/lib/prisma';

interface RefreshTokenPayload {
  jti: string;  // JWT ID (unique identifier for this token)
  userId: string;
  sessionId: string;
}

export class RefreshTokenService {
  private static readonly SECRET = (() => {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('REFRESH_TOKEN_SECRET must be set in production environment');
    }
    return secret || 'refresh-token-secret-dev-only';
  })();
  private static readonly EXPIRES_IN = '7d';  // Refresh tokens last longer than access tokens

  /**
   * Generate a new refresh token with database persistence
   */
  static async generateRefreshToken(userId: string, sessionId: string): Promise<string> {
    try {
      const jti = uuidv4();
      
      // Calculate expiration date
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      // Store the token in the database
      await prisma.refreshToken.create({
        data: {
          id: jti,
          userId,
          sessionId,
          expiresAt,
          isRevoked: false
        }
      });
      
      // Create JWT with the token ID
      const payload: RefreshTokenPayload = { jti, userId, sessionId };
      return sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
    } catch (error) {
      logger.error('Refresh token generation failed', { error, userId });
      throw new SecurityError('Failed to generate refresh token');
    }
  }

  /**
   * Verify a refresh token, invalidate it, and issue a new token pair
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string, refreshToken: string }> {
    // Initialize payload outside try/catch to fix scope issues
    let payload: RefreshTokenPayload | undefined;
    
    try {
      // Verify the refresh token
      try {
        payload = verify(refreshToken, this.SECRET) as RefreshTokenPayload;
      } catch (error: unknown) {
        if (error instanceof TokenExpiredError) {
          logger.warn('Expired refresh token used', { error });
          throw new SecurityError('Refresh token has expired');
        } else if (error instanceof JsonWebTokenError) {
          logger.warn('Invalid refresh token format', { error });
          throw new SecurityError('Invalid refresh token format');
        } else {
          logger.error('Refresh token verification failed', { error });
          throw new SecurityError('Failed to verify refresh token');
        }
      }
      
      // Validate payload structure
      if (!payload.jti || !payload.userId || !payload.sessionId) {
        logger.warn('Malformed refresh token payload', { 
          hasJti: !!payload.jti,
          hasUserId: !!payload.userId,
          hasSessionId: !!payload.sessionId
        });
        throw new SecurityError('Invalid refresh token format');
      }
      
      // Check if token exists and is not revoked in the database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { id: payload.jti }
      });
      
      if (!storedToken) {
        logger.warn('Refresh token not found in database', { jti: payload.jti });
        throw new SecurityError('Invalid refresh token');
      }
      
      if (storedToken.isRevoked) {
        logger.warn('Revoked refresh token used', { jti: payload.jti, userId: payload.userId });
        throw new SecurityError('Refresh token has been revoked');
      }
      
      if (storedToken.expiresAt < new Date()) {
        logger.warn('Expired refresh token used (DB check)', { jti: payload.jti });
        throw new SecurityError('Refresh token has expired');
      }
      
      // Fetch user data to get email and role
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          role: true
        }
      });
      
      if (!user) {
        logger.warn('User not found during token refresh', { userId: payload.userId });
        throw new SecurityError('User not found');
      }
      
      // Revoke the current token (token rotation)
      await prisma.refreshToken.update({
        where: { id: payload.jti },
        data: { isRevoked: true }
      });
      
      // Generate a new access token
      const accessToken = await TokenService.generateToken(
        user.id,
        user.email,
        typeof user.role === 'string' ? user.role : 'USER',
        payload.sessionId
      );
      
      // Generate a new refresh token
      const newRefreshToken = await this.generateRefreshToken(user.id, payload.sessionId);
      
      // Log the token rotation
      logger.info('Refresh token rotated', { 
        userId: user.id,
        oldTokenId: payload.jti,
        sessionId: payload.sessionId
      });
      
      return { 
        accessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      logger.error('Access token refresh failed', { error });
      throw new SecurityError('Failed to refresh access token');
    }
  }
  
  /**
   * Revoke all refresh tokens for a user or session
   */
  static async revokeTokens(options: { userId?: string, sessionId?: string }): Promise<void> {
    try {
      if (!options.userId && !options.sessionId) {
        throw new Error('Either userId or sessionId must be provided');
      }
      
      const where: { userId?: string, sessionId?: string } = {};
      if (options.userId) where.userId = options.userId;
      if (options.sessionId) where.sessionId = options.sessionId;
      
      await prisma.refreshToken.updateMany({
        where,
        data: { isRevoked: true }
      });
      
      logger.info('Refresh tokens revoked', { 
        userId: options.userId,
        sessionId: options.sessionId
      });
    } catch (error) {
      logger.error('Failed to revoke refresh tokens', { error, ...options });
      throw new SecurityError('Failed to revoke refresh tokens');
    }
  }
  
  /**
   * Clean up expired tokens (can be run as a scheduled job)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true, updatedAt: { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } // 30 days old revoked tokens
          ]
        }
      });
      
      logger.info(`Cleaned up ${result.count} expired refresh tokens`);
      return result.count;
    } catch (error) {
      logger.error('Failed to clean up expired tokens', { error });
      return 0;
    }
  }
} 