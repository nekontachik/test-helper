'use client';

import { prisma } from '@/lib/prisma';
import { UAParser } from 'ua-parser-js';
import { logger } from '@/lib/logger';
import { SessionError } from '@/lib/errors';
import { v4 as uuidv4 } from 'uuid';

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
  expiresAt: Date;
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
  deviceInfo: string | null;
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

  /**
   * Create a new session for a user
   */
  static async createSession(data: SessionData): Promise<string> {
    try {
      const sessionId = uuidv4();
      
      await prisma.session.create({
        data: {
          id: sessionId,
          userId: data.userId,
          userAgent: data.userAgent,
          ipAddress: data.ip,
          expiresAt: data.expiresAt,
          isActive: true
        }
      });
      
      logger.info('Session created', { userId: data.userId, sessionId });
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session', { error, userId: data.userId });
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate if a session is active and not expired
   */
  static async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId }
      });
      
      if (!session) {
        return false;
      }
      
      // Check if session is active and not expired
      const isValid = session.isActive && new Date() < session.expiresAt;
      
      // If session is expired but still marked as active, deactivate it
      if (!isValid && session.isActive) {
        await this.invalidateSession(sessionId);
      }
      
      return isValid;
    } catch (error) {
      logger.error('Session validation failed', { error, sessionId });
      return false;
    }
  }

  /**
   * Invalidate a session (logout)
   */
  static async invalidateSession(sessionId: string): Promise<void> {
    try {
      await prisma.session.update({
        where: { id: sessionId },
        data: { isActive: false }
      });
      
      logger.info('Session invalidated', { sessionId });
    } catch (error) {
      logger.error('Failed to invalidate session', { error, sessionId });
      throw new Error('Failed to invalidate session');
    }
  }

  /**
   * Invalidate all sessions for a user (force logout from all devices)
   */
  static async invalidateAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.session.updateMany({
        where: { 
          userId,
          isActive: true
        },
        data: { isActive: false }
      });
      
      logger.info('All user sessions invalidated', { userId });
    } catch (error) {
      logger.error('Failed to invalidate user sessions', { error, userId });
      throw new Error('Failed to invalidate user sessions');
    }
  }

  /**
   * Extend a session's expiration time
   */
  static async extendSession(sessionId: string, durationInHours = 24): Promise<void> {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + durationInHours);
      
      await prisma.session.update({
        where: { id: sessionId },
        data: { expiresAt }
      });
      
      logger.info('Session extended', { sessionId });
    } catch (error) {
      logger.error('Failed to extend session', { error, sessionId });
      throw new Error('Failed to extend session');
    }
  }

  /**
   * Clean up expired sessions (can be run as a scheduled job)
   */
  static async cleanupExpiredSessions(): Promise<number> {
    try {
      const result = await prisma.session.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          isActive: true
        },
        data: { isActive: false }
      });
      
      logger.info('Expired sessions cleaned up', { count: result.count });
      return result.count;
    } catch (error) {
      logger.error('Failed to clean up expired sessions', { error });
      throw new Error('Failed to clean up expired sessions');
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

  static async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const sessions = await prisma.session.findMany({
        where: {
          userId,
          expiresAt: { gt: new Date() },
        },
        orderBy: { lastActive: 'desc' },
      });

      return sessions.map((session: Session) => ({
        ...session,
        deviceInfo: this.deserializeDeviceInfo(session.deviceInfo),
      }));
    } catch (error) {
      logger.error('Failed to get user sessions:', { error, userId });
      throw new SessionError('Failed to get user sessions');
    }
  }
} 