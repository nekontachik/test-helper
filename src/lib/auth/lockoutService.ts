import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const LOCKOUT_THRESHOLD = 5; // Failed attempts before lockout
const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

export class LockoutService {
  static async recordFailedAttempt(userId: string) {
    const key = `lockout:${userId}`;
    const attempts = await redis.incr(key);
    
    if (attempts === 1) {
      await redis.expire(key, LOCKOUT_DURATION);
    }

    if (attempts >= LOCKOUT_THRESHOLD) {
      await this.lockAccount(userId);
    }

    return attempts;
  }

  static async lockAccount(userId: string) {
    const lockExpiry = new Date(Date.now() + LOCKOUT_DURATION * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        lockedUntil: lockExpiry,
        loginAttempts: 0,
      },
    });

    await redis.del(`lockout:${userId}`);
  }

  static async isAccountLocked(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockedUntil: true },
    });

    if (!user?.lockedUntil) {
      return false;
    }

    return user.lockedUntil > new Date();
  }

  static async resetAttempts(userId: string) {
    await redis.del(`lockout:${userId}`);
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
      },
    });
  }
} 