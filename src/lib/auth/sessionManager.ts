import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export class SessionManager {
  static async createSession(data: {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const parser = new UAParser(data.userAgent);
    const device = parser.getResult();

    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        deviceInfo: {
          browser: device.browser.name,
          os: device.os.name,
          device: device.device.type || 'desktop',
        },
      },
    });

    return session;
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { expires: true },
    });

    return !!session && session.expires > new Date();
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActive: new Date() },
    });
  }

  static async terminateSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  }

  static async terminateAllUserSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        userId,
        NOT: exceptSessionId ? { id: exceptSessionId } : undefined,
      },
    });
  }

  static async cleanupExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });
  }
}
