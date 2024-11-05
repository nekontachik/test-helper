import bcrypt from 'bcryptjs';
import { authenticator } from 'otplib';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import { RateLimitError, SecurityError } from '@/lib/errors';
import type { Prisma, User } from '@prisma/client';
import logger from '@/lib/logger';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';

// Constants
const SALT_ROUNDS = 12;
const BACKUP_CODES_COUNT = 10;
const RATE_LIMIT_DURATION = 300; // 5 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const PWNED_API_URL = 'https://api.pwnedpasswords.com/range/';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

// Type-safe Redis client
const redisClient = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface AttemptInfo {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
}

interface BackupCodesData {
  codes: string[];
  updatedAt: Date;
}

interface BruteForceConfig {
  login: {
    points: number;
    duration: number;
  };
  password: {
    points: number;
    duration: number;
  };
}

/**
 * Service for handling security-related operations
 */
export class SecurityService {
  private static readonly rateLimiter = new RateLimiter();
  private static readonly attemptCache = new Map<string, AttemptInfo>();
  
  private static readonly bruteForceConfig: BruteForceConfig = {
    login: {
      points: 5,
      duration: 300, // 5 minutes
    },
    password: {
      points: 3,
      duration: 3600, // 1 hour
    },
  };

  /**
   * Hashes a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new SecurityError('Failed to hash password');
    }
  }

  /**
   * Verifies a password against its hash
   */
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
      logger.error('Password verification failed:', error);
      throw new SecurityError('Failed to verify password');
    }
  }

  /**
   * Generates a TOTP secret
   */
  static generateTOTPSecret(): string {
    return authenticator.generateSecret();
  }

  /**
   * Verifies a TOTP token
   */
  static verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      logger.error('TOTP verification failed:', error);
      throw new SecurityError('Failed to verify TOTP token');
    }
  }

  /**
   * Generates backup codes
   */
  static generateBackupCodes(count: number = BACKUP_CODES_COUNT): string[] {
    try {
      return Array.from({ length: count }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );
    } catch (error) {
      logger.error('Backup code generation failed:', error);
      throw new SecurityError('Failed to generate backup codes');
    }
  }

  /**
   * Stores backup codes for a user
   */
  static async storeBackupCodes(userId: string, codes: string[]): Promise<void> {
    try {
      const hashedCodes = await Promise.all(
        codes.map(code => bcrypt.hash(code, SALT_ROUNDS))
      );

      const backupCodesData: BackupCodesData = {
        codes: hashedCodes,
        updatedAt: new Date()
      };

      await prisma.user.update({
        where: { id: userId },
        data: {
          backupCodesData: JSON.stringify(backupCodesData),
          backupCodesUpdatedAt: new Date()
        }
      });
    } catch (error) {
      logger.error('Failed to store backup codes:', error);
      throw new SecurityError('Failed to store backup codes');
    }
  }

  /**
   * Checks if a password has been breached
   */
  static async checkPasswordBreached(password: string): Promise<boolean> {
    try {
      const hash = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const response = await fetch(`${PWNED_API_URL}${prefix}`);
      if (!response.ok) {
        throw new Error('Password breach check failed');
      }

      const data = await response.text();
      return data.split('\n').some(line => {
        const [hashSuffix] = line.split(':');
        return hashSuffix === suffix;
      });
    } catch (error) {
      logger.error('Password breach check error:', error);
      return false; // Fail open if service is unavailable
    }
  }

  /**
   * Gets attempt info from Redis
   */
  private static async getAttemptInfo(key: string): Promise<AttemptInfo> {
    try {
      const info = await redisClient.get<AttemptInfo>(key);
      return info || {
        count: 0,
        firstAttempt: Date.now(),
        lastAttempt: Date.now()
      };
    } catch (error) {
      logger.error('Failed to get attempt info:', error);
      return {
        count: 0,
        firstAttempt: Date.now(),
        lastAttempt: Date.now()
      };
    }
  }

  /**
   * Gets security headers for HTTP responses
   */
  static getSecurityHeaders(): Record<string, string> {
    return {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
  }

  /**
   * Checks for brute force attempts
   */
  static async checkBruteForce(ip: string, type: 'login' | 'password'): Promise<void> {
    const config = this.bruteForceConfig[type];
    
    try {
      await this.rateLimiter.checkLimit(ip, config);
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw new RateLimitError(
          `Too many ${type} attempts. Please try again later.`,
          error.resetIn
        );
      }
      throw error;
    }
  }

  /**
   * Records a failed attempt
   */
  static async recordFailedAttempt(ip: string, type: 'login' | 'password'): Promise<void> {
    const key = `attempt:${type}:${ip}`;
    const info = await this.getAttemptInfo(key);
    
    info.count += 1;
    info.lastAttempt = Date.now();
    
    await redisClient.set(key, info, { ex: this.bruteForceConfig[type].duration });
  }

  /**
   * Resets attempt counter
   */
  static async resetAttempts(ip: string, type: 'login' | 'password'): Promise<void> {
    const key = `attempt:${type}:${ip}`;
    await redisClient.del(key);
  }
}
