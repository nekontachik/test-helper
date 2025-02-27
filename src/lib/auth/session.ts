import type { SessionStrategy } from "next-auth"
import { prisma } from '@/lib/prisma';
import type { AuthUser } from './types';
import { AuthError } from '@/lib/errors/AuthError'

export const SESSION_DURATIONS = {
  REMEMBERED: 30 * 24 * 60 * 60, // 30 days
  DEFAULT: 24 * 60 * 60, // 24 hours
} as const

export const SESSION_CONFIG = {
  strategy: "jwt" as SessionStrategy,
  maxAge: SESSION_DURATIONS.DEFAULT,
  updateAge: 12 * 60 * 60, // 12 hours
}

export const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
}

interface _SessionData {
  userId: string;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
  expiresAt: Date;
  lastActive: Date;
}

interface DbSession {
  id: string;
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  lastActive: Date;
  userAgent: string | null;
  ipAddress: string | null;
}

export class SessionManager {
  private static readonly MAX_SESSIONS = 5;
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  static async cleanup(): Promise<void> {
    const now = new Date();
    await prisma.session.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { lastActive: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
        ],
      },
    });
  }

  static async invalidateUserSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  static async createSession(
    user: AuthUser,
    userAgent?: string | null,
    ipAddress?: string | null
  ): Promise<DbSession> {
    const activeSessions = await prisma.session.count({
      where: { 
        userId: user.id, 
        expiresAt: { gt: new Date() } 
      }
    });

    if (activeSessions >= this.MAX_SESSIONS) {
      throw new AuthError(
        'Maximum number of active sessions reached',
        'MAX_SESSIONS_EXCEEDED',
        400
      );
    }

    return prisma.session.create({
      data: {
        userId: user.id,
        sessionToken: 'generated-token',
        userAgent: userAgent ?? undefined,
        ipAddress: ipAddress ?? undefined,
        expiresAt: new Date(Date.now() + this.SESSION_DURATION),
        lastActive: new Date()
      }
    });
  }

  static async validateSession(sessionId: string): Promise<DbSession> {
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new AuthError(
        'Session not found',
        'SESSION_NOT_FOUND',
        404
      );
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({ where: { id: sessionId } });
      throw new AuthError(
        'Session expired',
        'SESSION_EXPIRED',
        401
      );
    }

    return session;
  }

  static async updateSessionActivity(sessionId: string): Promise<void> {
    await prisma.session.update({
      where: { id: sessionId },
      data: { lastActive: new Date() }
    });
  }
} 