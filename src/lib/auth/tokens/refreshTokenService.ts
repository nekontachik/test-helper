import { prisma } from '@/lib/prisma';
import { sign, verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { SecurityError } from '@/lib/errors';
import logger from '@/lib/logger';
import { TokenService } from './tokenService';
import { SessionManager } from '../session/sessionManager';

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
   * Generate a new refresh token
   */
  static async generateRefreshToken(userId: string, sessionId: string): Promise<string> {
    try {
      const jti = uuidv4();
      
      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          id: jti,
          userId,
          sessionId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          isRevoked: false
        }
      });
      
      // Create JWT
      const payload: RefreshTokenPayload = { jti, userId, sessionId };
      return sign(payload, this.SECRET, { expiresIn: this.EXPIRES_IN });
    } catch (error) {
      logger.error('Refresh token generation failed', { error, userId });
      throw new SecurityError('Failed to generate refresh token');
    }
  }

  /**
   * Verify a refresh token and issue a new access token
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
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
      
      // Check if token exists, is not revoked, and not expired in one query
      const storedToken = await prisma.refreshToken.findFirst({
        where: { 
          id: payload.jti,
          isRevoked: false,
          expiresAt: { gt: new Date() }
        }
      });
      
      if (!storedToken) {
        // Try to find the token to determine the specific error
        const invalidToken = await prisma.refreshToken.findUnique({
          where: { id: payload.jti },
          select: { isRevoked: true, expiresAt: true }
        });
        
        if (!invalidToken) {
          throw new SecurityError('Invalid refresh token');
        } else if (invalidToken.isRevoked) {
          throw new SecurityError('Refresh token has been revoked');
        } else if (invalidToken.expiresAt < new Date()) {
          // Revoke expired token
          await this.revokeRefreshToken(payload.jti);
          throw new SecurityError('Refresh token expired');
        } else {
          throw new SecurityError('Invalid refresh token');
        }
      }
      
      // Validate the session
      const isSessionValid = await SessionManager.validateSession(payload.sessionId);
      if (!isSessionValid) {
        try {
          await this.revokeRefreshToken(payload.jti);
        } catch (revokeError) {
          logger.error('Failed to revoke token for invalid session', { 
            jti: payload.jti, 
            sessionId: payload.sessionId,
            error: revokeError 
          });
          // Continue with throwing the session error
        }
        throw new SecurityError('Session is invalid or expired');
      }
      
      // Get user information
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { email: true, role: true }
      });
      
      if (!user) {
        throw new SecurityError('User not found');
      }
      
      // Generate new access token
      const accessToken = await TokenService.generateToken(
        payload.userId,
        user.email,
        typeof user.role === 'string' ? user.role : 'USER'
      );
      
      // Update last used timestamp for the refresh token
      await prisma.refreshToken.update({
        where: { id: payload.jti },
        data: { lastUsed: new Date() }
      });
      
      return { accessToken };
    } catch (error: unknown) {
      const errorContext = {
        errorName: error instanceof Error ? error.name : 'Unknown error',
        errorMessage: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV !== 'production' && error instanceof Error ? error.stack : undefined
      };
      
      logger.error('Token refresh failed', { 
        error: errorContext,
        tokenJti: payload?.jti,
        userId: payload?.userId
      });
      
      throw new SecurityError('Failed to refresh token');
    }
  }

  /**
   * Revoke a refresh token
   */
  static async revokeRefreshToken(tokenId: string): Promise<void> {
    try {
      await prisma.refreshToken.update({
        where: { id: tokenId },
        data: { isRevoked: true }
      });
      
      logger.info('Refresh token revoked', { tokenId });
    } catch (error) {
      logger.error('Failed to revoke refresh token', { error, tokenId });
      throw new SecurityError('Failed to revoke refresh token');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserRefreshTokens(userId: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: { 
          userId,
          isRevoked: false
        },
        data: { isRevoked: true }
      });
      
      logger.info('All user refresh tokens revoked', { userId });
    } catch (error) {
      logger.error('Failed to revoke user refresh tokens', { error, userId });
      throw new SecurityError('Failed to revoke user refresh tokens');
    }
  }

  /**
   * Clean up expired refresh tokens (can be run as a scheduled job)
   */
  static async cleanupExpiredRefreshTokens(): Promise<number> {
    try {
      const result = await prisma.refreshToken.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isRevoked: false
        },
        data: { isRevoked: true }
      });
      
      logger.info('Expired refresh tokens cleaned up', { count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to clean up expired refresh tokens', { error });
      throw new SecurityError('Failed to clean up expired refresh tokens');
    }
  }
} 