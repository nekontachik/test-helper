import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';

export class SessionService {
  static async createSession(data: {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const parser = new UAParser(data.userAgent);
    const device = parser.getResult();

    return prisma.session.create({
      data: {
        userId: data.userId,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        deviceInfo: {
          browser: device.browser.name,
          os: device.os.name,
          device: device.device.type || 'desktop',
        },
      },
    });
  }

  static async getUserSessions(userId: string) {
    return prisma.session.findMany({
      where: {
        userId,
        expires: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastActive: 'desc',
      },
    });
  }

  static async terminateSession(sessionId: string, userId: string) {
    return prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  static async terminateAllSessions(userId: string, currentSessionId?: string) {
    return prisma.session.deleteMany({
      where: {
        userId,
        NOT: currentSessionId ? {
          id: currentSessionId,
        } : undefined,
      },
    });
  }

  static async updateSessionActivity(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { lastActive: new Date() },
    });
  }
}
