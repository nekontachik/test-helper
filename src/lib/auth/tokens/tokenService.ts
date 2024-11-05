import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import logger from '@/lib/logger';
import type { Prisma } from '@prisma/client';

// Custom error for token-related issues
class TokenError extends AppError {
  constructor(message: string) {
    super(message, 401, 'TOKEN_ERROR');
    this.name = 'TokenError';
  }
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  API_KEY = 'api_key',
}

export interface TokenPayload {
  type: TokenType;
  userId: string;
  email?: string;
}

// Cache for revoked tokens
const revokedTokensCache = new Map<string, boolean>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

export class TokenService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET!;
  private static readonly DEFAULT_EXPIRES = '15m';
  private static readonly BATCH_SIZE = 100;
  private static revokeQueue: string[] = [];
  private static revokeTimeout: NodeJS.Timeout | null = null;

  /**
   * Creates a new JWT token
   */
  public static async createToken(
    payload: TokenPayload,
    expiresIn: string = this.DEFAULT_EXPIRES
  ): Promise<string> {
    try {
      return jwt.sign(payload, this.JWT_SECRET, { 
        expiresIn,
        algorithm: 'HS256',
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      });
    } catch (error) {
      logger.error('Token creation failed:', error);
      throw new TokenError('Failed to create token');
    }
  }

  /**
   * Verifies a JWT token
   */
  public static async verifyToken(
    token: string,
    type: TokenType
  ): Promise<TokenPayload> {
    try {
      // Check cache first
      if (revokedTokensCache.has(token)) {
        throw new TokenError('Token has been revoked');
      }

      const payload = jwt.verify(token, this.JWT_SECRET, {
        algorithms: ['HS256'],
        audience: process.env.JWT_AUDIENCE,
        issuer: process.env.JWT_ISSUER,
      }) as TokenPayload;
      
      if (payload.type !== type) {
        throw new TokenError('Invalid token type');
      }

      // Check DB for revocation
      const isRevoked = await prisma.$transaction(async (tx) => {
        const revoked = await tx.revokedToken.findUnique({
          where: { token },
          select: { id: true }
        });
        return !!revoked;
      });

      if (isRevoked) {
        revokedTokensCache.set(token, true);
        throw new TokenError('Token has been revoked');
      }

      return payload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new TokenError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new TokenError('Invalid token');
      }
      logger.error('Token verification failed:', error);
      throw new TokenError('Failed to verify token');
    }
  }

  /**
   * Revokes a token by adding it to blacklist
   */
  public static async revokeToken(token: string, type: TokenType): Promise<void> {
    try {
      // Add to cache immediately
      revokedTokensCache.set(token, true);
      
      // Add to queue for batch processing
      this.revokeQueue.push(token);

      if (this.revokeQueue.length >= this.BATCH_SIZE) {
        await this.processRevokeQueue();
      } else if (!this.revokeTimeout) {
        this.revokeTimeout = setTimeout(() => this.processRevokeQueue(), 1000);
      }
    } catch (error) {
      logger.error('Token revocation failed:', error);
      throw new TokenError('Failed to revoke token');
    }
  }

  /**
   * Process queued token revocations in batch
   */
  private static async processRevokeQueue(): Promise<void> {
    if (this.revokeTimeout) {
      clearTimeout(this.revokeTimeout);
      this.revokeTimeout = null;
    }

    if (this.revokeQueue.length === 0) return;

    const tokensToRevoke = [...this.revokeQueue];
    this.revokeQueue = [];

    try {
      await prisma.$transaction(async (tx) => {
        // Process each token individually instead of using createMany
        await Promise.all(
          tokensToRevoke.map(token => 
            tx.revokedToken.upsert({
              where: { token },
              create: {
                token,
                type: TokenType.ACCESS,
                revokedAt: new Date(),
              },
              update: {} // No update needed since we're just ensuring it exists
            })
          )
        );
      });
    } catch (error) {
      logger.error('Batch token revocation failed:', error);
      // Re-queue failed tokens
      this.revokeQueue = [...tokensToRevoke, ...this.revokeQueue];
    }
  }

  // Clean up expired cache entries periodically
  static {
    setInterval(() => {
      const now = Date.now();
      revokedTokensCache.forEach((_, key) => {
        try {
          const payload = jwt.decode(key) as { exp?: number };
          if (payload?.exp && payload.exp * 1000 < now) {
            revokedTokensCache.delete(key);
          }
        } catch {
          // If token can't be decoded, remove it from cache
          revokedTokensCache.delete(key);
        }
      });
    }, CACHE_TTL);
  }
}

export { TokenError };