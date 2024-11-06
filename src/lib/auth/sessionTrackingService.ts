import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import type { Prisma } from '@prisma/client';

// Define activity type
type Activity = {
  id: string;
  action: string;
  timestamp: Date;
  details: string | null;
};

interface ActivityData {
  sessionId: string;
  action: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

interface SessionAnalytics {
  sessionDuration: number;
  device: Record<string, unknown>;
  browser: UAParser.IBrowser;
  os: UAParser.IOS;
  activities: Activity[];
  lastActive: Date;
}

export class SessionTrackingService {
  /**
   * Logs a new activity for a session and updates the session's last active timestamp
   */
  static async logActivity(activity: ActivityData): Promise<void> {
    try {
      await prisma.$transaction([
        prisma.session.update({
          where: { id: activity.sessionId },
          data: { lastActive: new Date() },
        }),
        prisma.sessionActivity.create({
          data: {
            action: activity.action,
            timestamp: activity.timestamp,
            details: activity.details ? JSON.stringify(activity.details) : null,
            sessionId: activity.sessionId,
          },
        }),
      ]);
    } catch (error) {
      console.error('Failed to log session activity:', error);
      throw new Error('Failed to log session activity');
    }
  }

  /**
   * Retrieves analytics data for a specific session
   */
  static async getSessionAnalytics(sessionId: string): Promise<SessionAnalytics> {
    try {
      const [session, activities] = await prisma.$transaction([
        prisma.session.findUnique({
          where: { id: sessionId },
          select: {
            lastActive: true,
            userAgent: true,
            deviceInfo: true,
          },
        }),
        prisma.sessionActivity.findMany({
          where: { sessionId },
          select: {
            id: true,
            action: true,
            timestamp: true,
            details: true,
          },
          orderBy: {
            timestamp: 'desc'
          }
        })
      ]);

      if (!session) {
        throw new Error('Session not found');
      }

      const parser = new UAParser(session.userAgent || '');
      const deviceInfo = session.deviceInfo ? JSON.parse(session.deviceInfo) : {};
      const firstActivity = activities[0];

      return {
        sessionDuration: session.lastActive 
          ? new Date(session.lastActive).getTime() - new Date(firstActivity?.timestamp || session.lastActive).getTime()
          : 0,
        device: deviceInfo,
        browser: parser.getBrowser(),
        os: parser.getOS(),
        activities,
        lastActive: session.lastActive,
      };
    } catch (error) {
      console.error('Failed to get session analytics:', error);
      throw error;
    }
  }

  /**
   * Retrieves all active sessions for a user with their recent activities
   */
  static async getUserSessions(userId: string): Promise<Array<{
    id: string;
    lastActive: Date;
    userAgent: string | null;
    deviceInfo: string | null;
    activities: Activity[];
  }>> {
    try {
      const sessions = await prisma.session.findMany({
        where: { 
          userId,
          expiresAt: { gt: new Date() },
        },
        select: {
          id: true,
          lastActive: true,
          userAgent: true,
          deviceInfo: true,
        },
        orderBy: {
          lastActive: 'desc'
        },
      });

      const sessionsWithActivities = await Promise.all(
        sessions.map(async (session) => {
          const activities = await prisma.sessionActivity.findMany({
            where: { sessionId: session.id },
            select: {
              id: true,
              action: true,
              timestamp: true,
              details: true,
            },
            orderBy: {
              timestamp: 'desc'
            },
            take: 5,
          });

          return {
            ...session,
            activities,
          };
        })
      );

      return sessionsWithActivities;
    } catch (error) {
      console.error('Failed to get user sessions:', error);
      throw new Error('Failed to retrieve user sessions');
    }
  }

  /**
   * Gets the count of currently active sessions
   */
  static async getActiveSessionCount(): Promise<number> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      
      return prisma.session.count({
        where: {
          AND: [
            { expiresAt: { gt: new Date() } },
            { lastActive: { gt: fifteenMinutesAgo } }
          ]
        },
      });
    } catch (error) {
      console.error('Failed to get active session count:', error);
      throw new Error('Failed to count active sessions');
    }
  }

  /**
   * Detects suspicious activity patterns in a session
   */
  static async detectSuspiciousActivity(sessionId: string): Promise<boolean> {
    try {
      const activities = await prisma.sessionActivity.findMany({
        where: { sessionId },
        select: {
          timestamp: true,
          details: true,
        },
        orderBy: {
          timestamp: 'desc'
        },
        take: 10,
      });

      if (!activities.length) return false;

      // Check for rapid location changes
      const uniqueIPs = new Set<string>();
      
      for (const activity of activities) {
        try {
          const details = JSON.parse(activity.details || '{}');
          if (details.ipAddress) {
            uniqueIPs.add(details.ipAddress);
            if (uniqueIPs.size > 3) return true;
          }
        } catch {
          continue;
        }
      }

      // Check for unusual timing patterns
      const timestamps = activities.map(activity => activity.timestamp.getTime());
      
      for (let i = 1; i < timestamps.length; i++) {
        if (timestamps[i - 1] - timestamps[i] < 1000) {
          return true; // Suspiciously rapid actions
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to detect suspicious activity:', error);
      throw new Error('Failed to check for suspicious activity');
    }
  }
} 