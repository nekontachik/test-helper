import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

interface DeviceInfo {
  browser: string | null;
  os: string | null;
  device: string;
}

interface Session {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  lastActive: Date;
  userAgent: string | null;
  ipAddress: string | null;
  deviceInfo: string | null;
}

export class SessionService {
  private static parseDeviceInfo(userAgent?: string): DeviceInfo | null {
    if (!userAgent) return null;
    
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      browser: result.browser.name || null,
      os: result.os.name || null,
      device: result.device.type || 'desktop',
    };
  }

  static async createSession(data: {
    userId: string;
    sessionToken: string;
    userAgent?: string;
    ipAddress?: string;
  }): Promise<Session> {
    const deviceInfo = this.parseDeviceInfo(data.userAgent);

    return prisma.session.create({
      data: {
        userId: data.userId,
        sessionToken: data.sessionToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        lastActive: new Date(),
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        deviceInfo: deviceInfo ? JSON.stringify(deviceInfo) : null,
      },
    });
  }

  static async getUserSessions(userId: string): Promise<Session[]> {
    return prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });
  }

  static async terminateSession(sessionId: string, userId: string): Promise<{ count: number }> {
    return prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  static async terminateAllSessions(userId: string, currentSessionId?: string): Promise<{ count: number }> {
    return prisma.session.deleteMany({
      where: {
        userId,
        NOT: currentSessionId ? {
          id: currentSessionId,
        } : undefined,
      },
    });
  }

  static async updateSessionActivity(sessionId: string): Promise<Session> {
    return prisma.session.update({
      where: { id: sessionId },
      data: { lastActive: new Date() },
    });
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session) return false;
    return session.expiresAt > new Date();
  }

  static async revokeSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  }

  static async cleanupExpiredSessions(): Promise<{ count: number }> {
    const result = await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    return { count: result.count };
  }
}
