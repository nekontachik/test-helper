import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { SessionManager } from './session/sessionManager';
import { AuthenticationError } from '@/lib/errors';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import type { UserRole } from '@/types/rbac';
import type { AccountStatus } from './types';
import logger from '@/lib/logger';
import type { AuthResult } from './types';
import type { PrismaClient } from '@prisma/client';
// Define User type locally instead of importing from @prisma/client
type User = {
  id: string;
  email: string;
  name?: string | null;
  passwordHash: string;
  role: string;
  status: string;
  failedLoginAttempts: number;
  emailVerified: Date | null;
  emailNotificationsEnabled?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: Date;
};
import { TokenType } from '@/types/token';
import { TokenService } from '@/lib/auth/tokens/tokenService';
import { SecurityService } from '@/lib/security/securityService';
import { RefreshTokenService } from '@/lib/auth/tokens/refreshTokenService';

interface LoginCredentials {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

interface EmailVerificationParams {
  userId: string;
  email: string;
  name: string;
}

export class AuthService {
  private static readonly SESSION_DURATION_HOURS = 24;

  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    const { email, password, ip, userAgent } = credentials;

    logger.debug('Login attempt', { email, ip: ip || 'unknown' });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    logger.debug('User lookup result', { found: !!user, email });

    if (!user) {
      logger.warn('Login attempt with non-existent email', { email, ip });
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if account is locked or disabled
    switch (user.status) {
      case 'LOCKED':
        logger.warn('Login attempt on locked account', { email, ip });
        throw new AuthenticationError('Account is locked. Please contact support.');
      case 'DISABLED':
        logger.warn('Login attempt on disabled account', { email, ip });
        throw new AuthenticationError('Account is disabled. Please contact support.');
      case 'PENDING':
        logger.warn('Login attempt on unverified account', { email, ip });
        throw new AuthenticationError('Please verify your email before logging in.');
    }

    // Verify password
    logger.debug('Verifying password');
    const isPasswordValid = await compare(password, user.passwordHash);
    logger.debug('Password verification result', { valid: isPasswordValid });

    if (!isPasswordValid) {
      // Log failed attempt and update failed attempts counter
      await this.handleFailedLoginAttempt(user, ip);
      throw new AuthenticationError('Invalid email or password');
    }

    // Reset failed attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await prisma.$transaction(async (prismaClient: PrismaClient) => {
        await prismaClient.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: 0 }
        });
        
        // Log the reset
        await AuditService.log({
          userId: user.id,
          action: AuditAction.RESET_FAILED_ATTEMPTS,
          type: AuditLogType.AUTH,
          details: { ip },
          status: 'SUCCESS'
        });
      });
    }

    // Create a session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + AuthService.SESSION_DURATION_HOURS);

    let sessionId: string;
    try {
      const sessionToken = crypto.randomUUID();
      sessionId = await SessionManager.createSession({
        userId: user.id,
        userAgent,
        ip,
        expiresAt,
        sessionToken
      });
    } catch (error) {
      logger.error('Failed to create session', { userId: user.id, error });
      throw new AuthenticationError('Authentication failed: Unable to create session');
    }

    let token: string;
    let refreshToken: string;

    try {
      // Generate authentication token with session ID
      token = await TokenService.generateToken(
        user.id, 
        user.email, 
        typeof user.role === 'string' ? user.role : 'USER',
        sessionId
      );
      
      // Generate refresh token
      refreshToken = await RefreshTokenService.generateRefreshToken(
        user.id,
        sessionId
      );
    } catch (error) {
      // Attempt to clean up the session if token generation fails
      try {
        await SessionManager.invalidateSession(sessionId); // Use invalidateSession instead of deleteSession
      } catch (cleanupError) {
        logger.error('Failed to clean up session after token generation failure', { 
          sessionId, 
          error: cleanupError 
        });
      }
      
      logger.error('Token generation failed', { userId: user.id, error });
      throw new AuthenticationError('Authentication failed: Unable to generate security tokens');
    }

    // Log successful login
    await AuditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      type: AuditLogType.AUTH,
      details: { ip, userAgent, sessionId },
      status: 'SUCCESS'
    });

    // Create a proper user object
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name ?? '',
      role: this.validateUserRole(user.role),
      permissions: [],
      status: user.status as AccountStatus,
      emailNotificationsEnabled: user.emailNotificationsEnabled ?? false,
      twoFactorEnabled: user.twoFactorEnabled ?? false,
      twoFactorAuthenticated: false,
      emailVerified: user.emailVerified,
      lastLoginAt: new Date(),
      createdAt: user.createdAt
    };

    return {
      token,
      refreshToken,
      user: authUser,
      expiresAt: expiresAt.getTime()
    };
  }

  /**
   * Handle failed login attempt
   */
  private static async handleFailedLoginAttempt(user: User, ip?: string): Promise<void> {
    const MAX_FAILED_ATTEMPTS = 5;
    
    // Increment failed attempts
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } }
    });

    // Log failed attempt
    await AuditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      type: AuditLogType.AUTH,
      details: { ip, failedAttempt: true },
      status: 'FAILED'
    });

    // Lock account if max attempts reached
    if (updatedUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
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
        action: AuditAction.ACCOUNT_LOCKOUT,
        type: AuditLogType.AUTH,
        details: { reason: 'Too many failed login attempts' },
        status: 'SUCCESS'
      });
    }
  }

  static async validateCredentials(email: string, password: string): Promise<Partial<User> | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        role: true,
        twoFactorEnabled: true,
        emailVerified: true,
      },
    });

    if (!user || !await compare(password, user.passwordHash)) {
      return null;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async initiateEmailVerification(_params: EmailVerificationParams): Promise<void> {
    // Implementation here
  }

  static async verifyEmail(token: string): Promise<Partial<User>> {
    const payload = await TokenService.verifyToken(token);
    if (!payload || payload.type !== TokenType.EMAIL_VERIFICATION) {
      throw new Error('Invalid verification token');
    }

    return await prisma.user.update({
      where: { id: payload.userId },
      data: { emailVerified: new Date() },
      select: {
        id: true,
        email: true,
        emailVerified: true,
      },
    });
  }

  static async initiatePasswordReset(_email: string): Promise<void> {
    // Implementation here
  }

  static async resetPassword(token: string, newPassword: string): Promise<Partial<User>> {
    const payload = await TokenService.verifyToken(token);
    if (!payload || payload.type !== TokenType.PASSWORD_RESET) {
      throw new Error('Invalid reset token');
    }

    const hashedPassword = await SecurityService.hashPassword(newPassword);
    return await prisma.user.update({
      where: { id: payload.userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        updatedAt: true,
      },
    });
  }

  private static validateUserRole(role: unknown): UserRole {
    const validRoles: UserRole[] = ['USER', 'ADMIN']; // Removed 'MODERATOR' as it's not in UserRole type
    return validRoles.includes(role as UserRole) ? (role as UserRole) : 'USER';
  }
}
