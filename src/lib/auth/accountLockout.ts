import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import { logger } from '@/lib/utils/logger';

interface LockoutInfo {
  isLocked: boolean;
  remainingAttempts: number;
  lockoutRemaining?: number;
}

interface LockoutConfig {
  maxAttempts: number;
  lockoutDuration: number; // in seconds
  attemptResetTime: number; // in seconds
}

export class AccountLockoutService {
  private static readonly DEFAULT_CONFIG: LockoutConfig = {
    maxAttempts: 5,
    lockoutDuration: 15 * 60, // 15 minutes
    attemptResetTime: 60 * 60, // 1 hour
  };

  private static redis: Redis;

  private static getRedis(): Redis {
    if (!this.redis) {
      this.redis = new Redis({
        url: process.env.UPSTASH_REDIS_URL!,
        token: process.env.UPSTASH_REDIS_TOKEN!,
      });
    }
    return this.redis;
  }

  private static getKey(identifier: string): string {
    return `login_attempts:${identifier}`;
  }

  static async getAttempts(identifier: string): Promise<number> {
    try {
      const attempts = await this.getRedis().get<number>(this.getKey(identifier));
      return attempts || 0;
    } catch (error) {
      logger.error('Failed to get login attempts:', { identifier, error });
      return 0;
    }
  }

  static async isLocked(identifier: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: identifier },
        select: { lockedUntil: true },
      });

      return !!user?.lockedUntil && user.lockedUntil > new Date();
    } catch (error) {
      logger.error('Failed to check account lock status:', { identifier, error });
      return false;
    }
  }

  static async incrementAttempts(
    identifier: string, 
    ip?: string,
    config: Partial<LockoutConfig> = {}
  ): Promise<void> {
    const { maxAttempts, lockoutDuration, attemptResetTime } = {
      ...this.DEFAULT_CONFIG,
      ...config,
    };

    try {
      const key = this.getKey(identifier);
      const attempts = await this.getAttempts(identifier);
      const newAttempts = attempts + 1;

      await this.getRedis().set(key, newAttempts, { ex: attemptResetTime });

      if (newAttempts >= maxAttempts) {
        const lockoutUntil = new Date(Date.now() + lockoutDuration * 1000);

        await prisma.user.update({
          where: { email: identifier },
          data: {
            lockedUntil: lockoutUntil,
            failedLoginAttempts: newAttempts,
          },
        });

        await AuditService.log({
          userId: identifier,
          type: AuditLogType.AUTH,
          action: AuditAction.ACCOUNT_LOCKOUT,
          metadata: {
            attempts: newAttempts,
            lockoutUntil,
            reason: 'max_attempts_exceeded',
          },
          context: {
            ip,
          },
        });

        logger.warn('Account locked due to too many failed attempts', {
          identifier,
          attempts: newAttempts,
          lockoutUntil,
          ip,
        });
      }
    } catch (error) {
      logger.error('Failed to increment login attempts:', { identifier, error });
      throw new Error('Failed to process login attempt');
    }
  }

  static async resetAttempts(identifier: string): Promise<void> {
    try {
      const key = this.getKey(identifier);
      await Promise.all([
        this.getRedis().del(key),
        prisma.user.update({
          where: { email: identifier },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
          },
        }),
      ]);

      logger.info('Reset login attempts and lock status', { identifier });
    } catch (error) {
      logger.error('Failed to reset login attempts:', { identifier, error });
      throw new Error('Failed to reset login attempts');
    }
  }

  static async getLockoutInfo(identifier: string): Promise<LockoutInfo> {
    try {
      const [attempts, user] = await Promise.all([
        this.getAttempts(identifier),
        prisma.user.findUnique({
          where: { email: identifier },
          select: { lockedUntil: true },
        }),
      ]);

      const isLocked = !!user?.lockedUntil && user.lockedUntil > new Date();
      const lockoutRemaining = isLocked && user?.lockedUntil
        ? Math.ceil((user.lockedUntil.getTime() - Date.now()) / 1000)
        : undefined;

      return {
        isLocked,
        remainingAttempts: Math.max(0, this.DEFAULT_CONFIG.maxAttempts - attempts),
        lockoutRemaining,
      };
    } catch (error) {
      logger.error('Failed to get lockout info:', { identifier, error });
      throw new Error('Failed to get account status');
    }
  }
} 