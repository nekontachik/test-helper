import { prisma } from '@/lib/prisma';
import type { ActivityEventType } from '@/types/activity';

export enum ActivityType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  PROFILE_UPDATED = 'PROFILE_UPDATED'
}

interface ActivityLogOptions {
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

export class ActivityService {
  static async log(
    userId: string, 
    type: ActivityEventType,
    options: ActivityLogOptions
  ): Promise<void> {
    try {
      // Skip activity logging for unknown users to avoid foreign key constraint errors
      if (userId === 'UNKNOWN') {
        console.log('Skipping activity log for unknown user:', {
          type: type.toString(),
          action: type.toString(),
          ipAddress: options.ip,
          userAgent: options.userAgent,
          metadata: options.metadata
        });
        return;
      }
      
      await prisma.activityLog.create({
        data: {
          userId,
          type: type.toString(),
          action: type.toString(),
          ipAddress: options.ip || null,
          userAgent: options.userAgent || null,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      // Don't throw the error, just log it to prevent API failures
    }
  }

  static async getRecentActivity(userId: string, limit = 10): Promise<unknown[]> {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        type: true,
        ipAddress: true,
        userAgent: true,
        metadata: true,
        createdAt: true
      }
    });
  }
} 