'use client';

import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import { AuditService } from '@/services/audit';
import { logger } from '@/lib/utils/logger';
import { SessionError } from '@/lib/errors';
import { AuditAction } from '@/types/audit';

/**
 * Session Manager
 * 
 * Handles session creation, validation, and cleanup with proper audit logging
 * and error handling.
 */

interface SessionData {
  userId: string;
  sessionToken: string;
  userAgent?: string;
  ip?: string;
}

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
  deviceInfo: DeviceInfo | null;
}

export class SessionManager {
  private static readonly SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

  private static parseDeviceInfo(userAgent: string): DeviceInfo {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    
    return {
      browser: result.browser.name || null,
      os: result.os.name || null,
      device: result.device.type || 'desktop',
    };
  }

  private static serializeDeviceInfo(deviceInfo: DeviceInfo | null): string | null {
    return deviceInfo ? JSON.stringify(deviceInfo) : null;
  }

  private static deserializeDeviceInfo(deviceInfo: string | null): DeviceInfo | null {
    try {
      return deviceInfo ? JSON.parse(deviceInfo) : null;
    } catch {
      return null;
    }
  }

  static async createSession(data: SessionData): Promise<Session> {
    try {
      const deviceInfo = data.userAgent 
        ? this.parseDeviceInfo(data.userAgent)
        : null;

      const session = await prisma.session.create({
        data: {
          userId: data.userId,
          sessionToken: data.sessionToken,
          expiresAt: new Date(Date.now() + this.SESSION_DURATION),
          lastActive: new Date(),
          userAgent: data.userAgent,
          ipAddress: data.ip,
          deviceInfo: this.serializeDeviceInfo(deviceInfo),
        },
      });

      await AuditService.log({
        userId: data.userId,
        type: 'auth',
        action: AuditAction.SESSION_CREATED,
        metadata: {
          sessionId: session.id,
          deviceInfo,
          ip: data.ip,
        },
      });

      return {
        ...session,
        deviceInfo,
      };
    } catch (error) {
      logger.error('Failed to create session:', { error, userId: data.userId });
      throw new SessionError('Failed to create session');
    }
  }

  static async updateSessionActivity(sessionId: string): Promise<Session> {
    try {
      const session = await prisma.session.update({
        where: { id: sessionId },
        data: { lastActive: new Date() },
      });

      return {
        ...session,
        deviceInfo: this.deserializeDeviceInfo(session.deviceInfo),
      };
    } catch (error) {
      logger.error('Failed to update session activity:', { error, sessionId });
      throw new SessionError('Failed to update session activity');
    }
  }

  static async invalidateSession(sessionId: string): Promise<void> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { userId: true },
      });

      if (!session) {
        logger.warn('Session not found for invalidation:', { sessionId });
        return;
      }

      await Promise.all([
        prisma.session.delete({
          where: { id: sessionId },
        }),
        AuditService.log({
          userId: session.userId,
          type: 'auth',
          action: AuditAction.SESSION_INVALIDATED,
          metadata: { 
            sessionId,
            reason: 'manual_invalidation',
          },
        }),
      ]);
    } catch (error) {
      logger.error('Failed to invalidate session:', { error, sessionId });
      throw new SessionError('Failed to invalidate session');
    }
  }

  static async invalidateUserSessions(userId: string, currentSessionId?: string): Promise<void> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          NOT: currentSessionId ? { id: currentSessionId } : undefined,
        },
      });

      await Promise.all([
        prisma.session.deleteMany({
          where: {
            userId,
            NOT: currentSessionId ? { id: currentSessionId } : undefined,
          },
        }),
        ...sessions.map(session =>
          AuditService.log({
            userId,
            type: 'auth',
            action: AuditAction.SESSION_INVALIDATED,
            metadata: { 
              sessionId: session.id, 
              reason: 'bulk_invalidation',
            },
          })
        ),
      ]);
    } catch (error) {
      logger.error('Failed to invalidate user sessions:', { error, userId });
      throw new SessionError('Failed to invalidate user sessions');
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    try {
      const now = new Date();
      const expiredSessions = await prisma.session.findMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { lastActive: { lt: new Date(now.getTime() - this.SESSION_DURATION) } },
          ],
        },
        select: { id: true, userId: true },
      });

      await Promise.all([
        prisma.session.deleteMany({
          where: {
            id: { in: expiredSessions.map(s => s.id) },
          },
        }),
        ...expiredSessions.map(session =>
          AuditService.log({
            userId: session.userId,
            type: 'auth',
            action: AuditAction.SESSION_EXPIRED,
            metadata: { 
              sessionId: session.id, 
              reason: 'expired',
            },
          })
        ),
      ]);
    } catch (error) {
      logger.error('Failed to cleanup expired sessions:', { error });
      throw new SessionError('Failed to cleanup expired sessions');
    }
  }

  static async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastActive: 'desc' },
      });

      return sessions.map(session => ({
        ...session,
        deviceInfo: this.deserializeDeviceInfo(session.deviceInfo),
      }));
    } catch (error) {
      logger.error('Failed to get user sessions:', { error, userId });
      throw new SessionError('Failed to get user sessions');
    }
  }

  static async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        logger.debug('Session not found:', { sessionId });
        return false;
      }

      const isValid = session.expiresAt > new Date();
      if (!isValid) {
        await this.invalidateSession(sessionId);
        logger.debug('Session expired:', { sessionId });
      }

      return isValid;
    } catch (error) {
      logger.error('Failed to validate session:', { error, sessionId });
      throw new SessionError('Failed to validate session');
    }
  }
} 