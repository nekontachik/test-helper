import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { v4 as uuidv4 } from 'uuid';

/**
 * Server Session Manager
 * 
 * Handles session creation, validation, and cleanup with proper audit logging
 * and error handling. This version is designed to work in server components.
 */

interface SessionData {
  userId: string;
  sessionToken?: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
}

export class ServerSessionManager {
  /**
   * Create a new session for a user
   */
  static async createSession(data: SessionData): Promise<string> {
    try {
      const sessionId = uuidv4();
      const sessionToken = data.sessionToken || uuidv4();
      
      await prisma.session.create({
        data: {
          id: sessionId,
          sessionToken,
          userId: data.userId,
          userAgent: data.userAgent,
          ipAddress: data.ip,
          expiresAt: data.expiresAt
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
      
      // Check if session is not expired
      const isValid = new Date() < session.expiresAt;
      
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
      // Since there's no isActive field, we'll set the expiresAt to now
      // to effectively invalidate the session
      await prisma.session.update({
        where: { id: sessionId },
        data: { expiresAt: new Date() }
      });
      
      logger.info('Session invalidated', { sessionId });
    } catch (error) {
      logger.error('Failed to invalidate session', { error, sessionId });
      throw new Error('Failed to invalidate session');
    }
  }
} 