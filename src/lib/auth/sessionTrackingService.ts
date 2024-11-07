import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';

interface SessionTrackingData {
  sessionId: string;
  userId: string;
  ip?: string;
  userAgent?: string;
}

export class SessionTrackingService {
  static async trackSession(data: SessionTrackingData): Promise<void> {
    try {
      await prisma.session.update({
        where: { id: data.sessionId },
        data: {
          lastActive: new Date(),
          activities: {
            create: {
              action: 'SESSION_ACTIVITY',
              details: JSON.stringify({
                ip: data.ip,
                userAgent: data.userAgent,
              }),
            },
          },
        },
      });
    } catch (error) {
      logger.error('Failed to track session activity:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: data.sessionId,
        userId: data.userId,
      });
    }
  }
} 