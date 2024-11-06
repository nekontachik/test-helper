import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/utils/logger';
import type { Prisma } from '@prisma/client';

export type ActivityType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED'
  | 'API_KEY_MANAGEMENT';

interface ActivityLogData {
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {
  // Cache frequently used queries
  private static queryCache = new Map<string, { data: any; timestamp: number }>();
  private static CACHE_TTL = 60000; // 1 minute

  static async log(
    userId: string,
    type: ActivityType,
    data?: ActivityLogData
  ) {
    try {
      const activityData: Prisma.ActivityLogCreateInput = {
        user: {
          connect: { id: userId }
        },
        type,
        action: type,
        ipAddress: data?.ip,
        userAgent: data?.userAgent,
        metadata: data?.metadata ? JSON.stringify(data.metadata) : null,
      };

      // Use transaction for atomic operation
      await prisma.$transaction(async (tx) => {
        await tx.activityLog.create({
          data: activityData,
        });

        // Invalidate cache for this user's activities
        this.invalidateCache(userId);
      });
    } catch (error) {
      logger.error('Activity log error:', {
        error,
        userId,
        type,
        data,
      });
      // Don't throw - logging should not break the main flow
    }
  }

  static async getRecentActivity(userId: string, limit = 10) {
    const cacheKey = `recent:${userId}:${limit}`;
    
    try {
      // Check cache first
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const activities = await prisma.activityLog.findMany({
        where: { 
          user: { id: userId }
        },
        select: {
          id: true,
          type: true,
          action: true,
          ipAddress: true,
          userAgent: true,
          metadata: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      // Cache the result
      this.setCachedData(cacheKey, activities);

      return activities;
    } catch (error) {
      logger.error('Failed to get recent activity:', {
        error,
        userId,
        limit,
      });
      return [];
    }
  }

  static async getSuspiciousActivity(userId: string) {
    const cacheKey = `suspicious:${userId}`;
    
    try {
      // Check cache first
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const activities = await prisma.activityLog.findMany({
        where: {
          user: { id: userId },
          type: { in: ['LOGIN_FAILED', 'ACCOUNT_LOCKED'] },
        },
        select: {
          id: true,
          type: true,
          action: true,
          ipAddress: true,
          userAgent: true,
          metadata: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      // Cache the result
      this.setCachedData(cacheKey, activities);

      return activities;
    } catch (error) {
      logger.error('Failed to get suspicious activity:', {
        error,
        userId,
      });
      return [];
    }
  }

  private static getCachedData(key: string) {
    const cached = this.queryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.queryCache.delete(key);
    return null;
  }

  private static setCachedData(key: string, data: any) {
    this.queryCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private static invalidateCache(userId: string) {
    for (const key of this.queryCache.keys()) {
      if (key.includes(userId)) {
        this.queryCache.delete(key);
      }
    }
  }

  // Clean up expired cache entries periodically
  static {
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.queryCache.entries()) {
        if (now - value.timestamp >= this.CACHE_TTL) {
          this.queryCache.delete(key);
        }
      }
    }, this.CACHE_TTL);
  }
} 