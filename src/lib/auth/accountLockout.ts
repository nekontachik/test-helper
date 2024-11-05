import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import { AuditService, AuditAction } from '@/lib/audit/auditService';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export class AccountLockoutService {
  static readonly MAX_ATTEMPTS = 5;
  static readonly LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds
  static readonly ATTEMPT_RESET = 60 * 60; // 1 hour in seconds

  private static getKey(identifier: string): string {
    return `login_attempts:${identifier}`;
  }

  static async getAttempts(identifier: string): Promise<number> {
    const attempts = await redis.get<number>(this.getKey(identifier));
    return attempts || 0;
  }

  static async isLocked(identifier: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email: identifier },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) return false;
    return user.lockedUntil > new Date();
  }

  static async incrementAttempts(identifier: string, ip?: string): Promise<void> {
    const key = this.getKey(identifier);
    const attempts = await this.getAttempts(identifier);
    const newAttempts = attempts + 1;

    await redis.set(key, newAttempts, { ex: this.ATTEMPT_RESET });

    if (newAttempts >= this.MAX_ATTEMPTS) {
      const lockoutUntil = new Date(Date.now() + this.LOCKOUT_DURATION * 1000);

      await prisma.user.update({
        where: { email: identifier },
        data: {
          lockedUntil: lockoutUntil,
          failedLoginAttempts: newAttempts,
        },
      });

      // Log account lockout
      await AuditService.log({
        userId: 'system',
        action: AuditAction.ACCOUNT_LOCKOUT,
        metadata: {
          email: identifier,
          attempts: newAttempts,
          lockoutUntil,
          ip,
        },
      });
    }
  }

  static async resetAttempts(identifier: string): Promise<void> {
    const key = this.getKey(identifier);
    await redis.del(key);

    await prisma.user.update({
      where: { email: identifier },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
  }

  static async getLockoutInfo(identifier: string): Promise<{
    isLocked: boolean;
    remainingAttempts: number;
    lockoutRemaining?: number;
  }> {
    const [attempts, user] = await Promise.all([
      this.getAttempts(identifier),
      prisma.user.findUnique({
        where: { email: identifier },
        select: { lockedUntil: true },
      }),
    ]);

    const isLocked = user?.lockedUntil && user.lockedUntil > new Date();
    const lockoutRemaining = isLocked
      ? Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 1000)
      : undefined;

    return {
      isLocked,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - attempts),
      lockoutRemaining,
    };
  }
} 