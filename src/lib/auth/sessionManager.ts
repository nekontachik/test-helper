import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import crypto from 'crypto';

export class SessionManager {
  static async createSession(data: {
    userId: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const parser = new UAParser(data.userAgent);
    const device = parser.getResult();
    
    // Generate a secure random session token
    const sessionToken = crypto.randomBytes(32).toString('hex');

    const session = await prisma.session.create({
      data: {
        userId: data.userId,
        sessionToken,
        userAgent: data.userAgent,
        ipAddress: data.ipAddress,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        deviceInfo: JSON.stringify({
          browser: device.browser.name,
          os: device.os.name,
          device: device.device.type || 'desktop',
        }),
      },
    });

    return session;
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      select: { expiresAt: true },
    });

    return !!session && session.expiresAt > new Date();
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
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}
