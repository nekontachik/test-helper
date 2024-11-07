import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SessionManager } from './session/sessionManager';
import { AuthenticationError } from '@/lib/errors';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import { UserRole } from '@/types/rbac';
import { AccountStatus } from './types';
import logger from '@/lib/logger';
import type { AuthResult } from './types';

interface LoginCredentials {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          status: true,
          twoFactorEnabled: true,
          emailVerified: true,
          failedLoginAttempts: true,
          lockedUntil: true,
        },
      });

      if (!user) {
        throw new AuthenticationError('Invalid email or password');
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        throw new AuthenticationError('Account is temporarily locked');
      }

      // Verify password
      const isValidPassword = await compare(credentials.password, user.password);
      if (!isValidPassword) {
        await this.handleFailedLogin(user.id);
        throw new AuthenticationError('Invalid email or password');
      }

      // Reset failed login attempts
      if (user.failedLoginAttempts > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            failedLoginAttempts: 0,
            lockedUntil: null
          },
        });
      }

      // Create session
      const session = await SessionManager.createSession({
        userId: user.id,
        sessionToken: crypto.randomUUID(),
        ip: credentials.ip,
        userAgent: credentials.userAgent,
      });

      // Log successful login
      await AuditService.log({
        type: AuditLogType.SECURITY,
        userId: user.id,
        action: AuditAction.USER_LOGIN,
        metadata: {
          ip: credentials.ip,
          userAgent: credentials.userAgent,
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          status: user.status as AccountStatus,
          twoFactorEnabled: user.twoFactorEnabled,
          emailVerified: user.emailVerified,
          twoFactorAuthenticated: false,
          permissions: [],
        },
        token: session.sessionToken,
        expiresAt: session.expiresAt.getTime(),
      };
    } catch (error) {
      // Log failed login attempt
      if (error instanceof AuthenticationError) {
        await AuditService.log({
          type: AuditLogType.SECURITY,
          userId: credentials.email, // Use email as userId for failed attempts
          action: AuditAction.USER_LOGIN_FAILED,
          metadata: {
            ip: credentials.ip,
            userAgent: credentials.userAgent,
            reason: error.message,
          },
        });
      }

      logger.error('Login failed:', error);
      throw error;
    }
  }

  private static async handleFailedLogin(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    });

    const attempts = (user?.failedLoginAttempts || 0) + 1;
    const shouldLock = attempts >= 5;

    await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        lockedUntil: shouldLock ? new Date(Date.now() + 15 * 60 * 1000) : null, // Lock for 15 minutes
      },
    });
  }
}
