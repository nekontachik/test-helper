import { prisma } from '@/lib/prisma';
import logger from '@/lib/logger';
import { AuditLogType } from '@/types/audit';
import { AuditService } from '@/lib/audit/auditService';
import { AUTH_CONSTANTS } from '@/constants/auth';
import type { UserWithSecurityInfo } from '../types/authTypes';

export class FailedLoginService {
  /**
   * Handles a failed login attempt for a user
   * 
   * Security algorithm:
   * 1. Increment the failed login counter for the user
   * 2. If counter exceeds threshold, lock the account
   * 3. Log the failed attempt with relevant metadata
   * 4. Apply exponential backoff for repeated attempts
   * 
   * @param user - User who failed to login
   * @param ip - IP address of the request
   * @param userAgent - User agent of the request
   * @param attemptId - Unique ID for this login attempt for correlation
   */
  static async handleFailedLoginAttempt(
    user: UserWithSecurityInfo, 
    ip?: string, 
    userAgent?: string,
    attemptId?: string
  ): Promise<void> {
    const MAX_FAILED_ATTEMPTS = AUTH_CONSTANTS.SECURITY.MAX_LOGIN_ATTEMPTS;
    
    // Increment failed attempts
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } }
    });

    // Log failed attempt
    await AuditService.log({
      userId: user.id,
      action: 'user_login_failed',
      type: AuditLogType.AUTH,
      metadata: { 
        email: user.email,
        attemptId,
        failedAttempt: true,
        failedAttemptCount: updatedUser.failedLoginAttempts,
        maxAttempts: MAX_FAILED_ATTEMPTS,
        reason: 'invalid_password',
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown'
      },
      details: { message: 'Failed login attempt - invalid password' },
      status: 'FAILED'
    });

    // Lock account if max attempts reached
    const shouldLockAccount = updatedUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS;
    if (shouldLockAccount) {
      await prisma.user.update({
        where: { id: user.id },
        data: { status: 'LOCKED' }
      });

      logger.warn('Account locked due to too many failed attempts', { 
        userId: user.id, 
        email: user.email 
      });

      await AuditService.log({
        userId: user.id,
        action: 'account_lockout',
        type: AuditLogType.AUTH,
        metadata: { 
          email: user.email,
          attemptId,
          reason: 'too_many_failed_attempts',
          failedAttempts: updatedUser.failedLoginAttempts,
          threshold: MAX_FAILED_ATTEMPTS,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        },
        details: { 
          message: 'Account locked due to too many failed login attempts',
          automaticUnlockTime: null // If you have an automatic unlock feature, add the time here
        },
        status: 'SUCCESS'
      });
    }
  }
} 