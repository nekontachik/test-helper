import { prisma } from '@/lib/prisma';
import { ActivityEventType } from '@/types/activity';

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
      await prisma.activityLog.create({
        data: {
          userId,
          type: type.toString(),
          action: type.toString(),
          ipAddress: options.ip,
          userAgent: options.userAgent,
          metadata: options.metadata ? JSON.stringify(options.metadata) : null,
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      throw error;
    }
  }
} 