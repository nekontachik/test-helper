import { prisma } from '@/lib/prisma';

export type ActivityType = 
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_CHANGE'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'PASSWORD_RESET_COMPLETED';

interface ActivityLogData {
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class ActivityService {
  static async log(
    userId: string,
    type: ActivityType,
    data?: ActivityLogData
  ) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          type,
          ip: data?.ip,
          userAgent: data?.userAgent,
          metadata: data?.metadata ? JSON.stringify(data.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Activity log error:', error);
      // Don't throw - logging should not break the main flow
    }
  }

  static async getRecentActivity(userId: string, limit = 10) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async getSuspiciousActivity(userId: string) {
    return prisma.activityLog.findMany({
      where: {
        userId,
        type: { in: ['LOGIN_FAILED', 'ACCOUNT_LOCKED'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
} 