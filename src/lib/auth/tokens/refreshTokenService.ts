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
   * Generate a new refresh token
   */
  static async generateRefreshToken(userId: string, sessionId: string): Promise<string> {
    try {
      const jti = uuidv4();
      
      // Create JWT without database storage for now
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
      
      // Generate a new access token
      const accessToken = await TokenService.generateToken(
        user.id,
        user.email,
        typeof user.role === 'string' ? user.role : 'USER',
        payload.sessionId
      );
      
      return { accessToken };
    } catch (error) {
      if (error instanceof SecurityError) {
        throw error;
      }
      logger.error('Access token refresh failed', { error });
      throw new SecurityError('Failed to refresh access token');
    }
  }
} 