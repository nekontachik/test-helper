import { prisma } from '@/lib/prisma';
import type { Session } from '@prisma/client';
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

  static async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    
    await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          {
            lastActive: { lt: new Date(now.getTime() - 24 * 60 * 60 * 1000) }, // 24 hours inactive
          }
        ]
      }
    });
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActive: new Date() }
    });
  }

  static async getSession(sessionId: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { id: sessionId }
    });
  }
} 