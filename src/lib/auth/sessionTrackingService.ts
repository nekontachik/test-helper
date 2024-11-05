import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import type { Session, SessionActivity } from '@prisma/client';

interface ActivityData {
  sessionId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, any>;
}

export class SessionTrackingService {
  static async logActivity(activity: ActivityData): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.sessionActivity.create({
        data: {
          sessionId: activity.sessionId,
          action: activity.action,
          timestamp: activity.timestamp,
          details: activity.details ? JSON.stringify(activity.details) : null,
        },
      });

      await tx.session.update({
        where: { id: activity.sessionId },
        data: { lastActive: new Date() },
      });
    });
  }

  static async getSessionAnalytics(sessionId: string) {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        activities: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      },
    });

    if (!session) {
      throw new Error('Session not found');
    }

    const parser = new UAParser(session.userAgent || '');
    const deviceInfo = JSON.parse(session.deviceInfo || '{}');

    return {
      sessionDuration: session.lastActive 
        ? new Date(session.lastActive).getTime() - new Date(session.createdAt).getTime()
        : 0,
      device: deviceInfo,
      browser: parser.getBrowser(),
      os: parser.getOS(),
      activities: session.activities,
      lastActive: session.lastActive,
    };
  }

  static async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: { 
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        activities: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 5,
        },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });
  }

  static async getActiveSessionCount(): Promise<number> {
    return prisma.session.count({
      where: {
        expiresAt: {
          gt: new Date(),
        },
        lastActive: {
          gt: new Date(Date.now() - 15 * 60 * 1000), // Active in last 15 minutes
        },
      },
    });
  }

  static async detectSuspiciousActivity(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        activities: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!session) return false;

    // Check for rapid location changes
    const uniqueIPs = new Set(
      session.activities
        .map(a => JSON.parse(a.details || '{}').ipAddress)
        .filter(Boolean)
    );
    if (uniqueIPs.size > 3) return true;

    // Check for unusual timing patterns
    const activities = session.activities.map(a => a.timestamp.getTime());
    for (let i = 1; i < activities.length; i++) {
      const timeDiff = activities[i - 1] - activities[i];
      if (timeDiff < 1000) return true; // Suspiciously rapid actions
    }

    return false;
  }
} 