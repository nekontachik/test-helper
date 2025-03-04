import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@/types/auth';
import type { AccountStatus } from '@/types/auth';
import { TokenService } from '@/lib/auth/tokens/tokenService';
import { RefreshTokenService } from '@/lib/auth/tokens/refreshTokenService';
import { isValidUserRole } from '@/lib/utils/typeGuards';
import { 
  InvalidCredentialsError, 
  AccountLockedError,
  AccountDisabledError,
  EmailNotVerifiedError
} from '@/lib/errors/authErrors';
import { AUTH_CONSTANTS } from '@/constants/auth';
import { securityLogger } from '@/lib/utils/securityLogger';
import { AuditLogType } from '@/types/audit';
import { AuditService } from '@/lib/audit/auditService';
import { FailedLoginService } from './failedLoginService';
import type { 
  AuthResultWithTokens, 
  LoginCredentials, 
  UserWithSecurityInfo 
} from '../types/authTypes';

export class LoginService {
  private static readonly SESSION_DURATION_HOURS = AUTH_CONSTANTS.SESSION.DEFAULT_DURATION_HOURS;

  /**
   * Authenticates a user with email and password
   * 
   * Security measures implemented:
   * 1. Rate limiting: Prevents brute force attacks by limiting login attempts
   * 2. Account locking: Locks account after multiple failed attempts
   * 3. Password hashing: Passwords are never stored or compared in plain text
   * 4. Audit logging: All login attempts (successful or failed) are logged
   * 
   * @param credentials - Login credentials including email, password, and metadata
   * @returns Authentication result with tokens and user information
   * @throws InvalidCredentialsError if credentials are invalid
   * @throws AccountLockedError if the account is locked
   * @throws AccountDisabledError if the account is disabled
   * @throws EmailNotVerifiedError if email verification is required but not completed
   */
  static async login(credentials: LoginCredentials): Promise<AuthResultWithTokens> {
    const { email, password, ip, userAgent } = credentials;
    const loginAttemptId = uuidv4();
    const requireEmailVerification = true; // Could be a config option
    
    // Log the login attempt
    securityLogger.info('Login attempt initiated', {
      email,
      attemptId: loginAttemptId,
      ip: ip || 'unknown',
      userAgent: userAgent || 'unknown'
    });
    
    // Create audit log entry for the attempt
    await AuditService.log({
      userId: 'anonymous', // We don't know the user ID yet
      action: 'user_login_attempt', // Using string literal instead of enum
      type: AuditLogType.AUTH,
      metadata: { 
        email,
        attemptId: loginAttemptId,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown'
      },
      details: { message: 'Login attempt initiated' },
      status: 'SUCCESS' // Changed from 'PENDING' to 'SUCCESS'
    });
    
    try {
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          status: true,
          failedLoginAttempts: true,
          emailVerified: true,
          twoFactorEnabled: true
        }
      });
      
      // Check if user exists
      if (!user) {
        // Handle non-existent user (same as invalid password for security)
        securityLogger.warn('Login failed: User not found', {
          email,
          attemptId: loginAttemptId,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        });
        
        await AuditService.log({
          userId: 'anonymous',
          action: 'user_login_failed',
          type: AuditLogType.AUTH,
          metadata: { 
            email,
            attemptId: loginAttemptId,
            reason: 'USER_NOT_FOUND',
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown'
          },
          details: { message: 'Login failed: User not found' },
          status: 'FAILED'
        });
        
        throw new InvalidCredentialsError({ email, attemptId: loginAttemptId });
      }
      
      // Check account status
      if (user.status === 'LOCKED') { // Using string literal instead of enum
        securityLogger.warn('Login failed: Account locked', {
          userId: user.id,
          email: user.email,
          attemptId: loginAttemptId,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        });
        
        await AuditService.log({
          userId: user.id,
          action: 'user_login_failed',
          type: AuditLogType.AUTH,
          metadata: { 
            email: user.email,
            attemptId: loginAttemptId,
            reason: 'ACCOUNT_LOCKED',
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown'
          },
          details: { message: 'Login failed: Account locked' },
          status: 'FAILED'
        });
        
        throw new AccountLockedError({ userId: user.id, attemptId: loginAttemptId });
      }
      
      if (user.status === 'DISABLED') { // Using string literal instead of enum
        securityLogger.warn('Login failed: Account disabled', {
          userId: user.id,
          email: user.email,
          attemptId: loginAttemptId,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        });
        
        await AuditService.log({
          userId: user.id,
          action: 'user_login_failed',
          type: AuditLogType.AUTH,
          metadata: { 
            email: user.email,
            attemptId: loginAttemptId,
            reason: 'ACCOUNT_DISABLED',
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown'
          },
          details: { message: 'Login failed: Account disabled' },
          status: 'FAILED'
        });
        
        throw new AccountDisabledError({ userId: user.id, attemptId: loginAttemptId });
      }
      
      // Verify password
      const isPasswordValid = await compare(password, user.password);
      
      if (!isPasswordValid) {
        // Handle failed login attempt
        const userWithSecurityInfo: UserWithSecurityInfo = {
          id: user.id,
          email: user.email,
          role: user.role as UserRole, // Cast to UserRole
          status: user.status as AccountStatus, // Cast to AccountStatus
          emailVerified: user.emailVerified,
          failedLoginAttempts: user.failedLoginAttempts
        };
        
        await FailedLoginService.handleFailedLoginAttempt(userWithSecurityInfo, ip, userAgent, loginAttemptId);
        
        throw new InvalidCredentialsError({ 
          userId: user.id, 
          email: user.email,
          attemptId: loginAttemptId 
        });
      }
      
      // Check email verification if required
      if (requireEmailVerification && !user.emailVerified) {
        securityLogger.warn('Login failed: Email not verified', {
          userId: user.id,
          email: user.email,
          attemptId: loginAttemptId,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        });
        
        await AuditService.log({
          userId: user.id,
          action: 'user_login_failed',
          type: AuditLogType.AUTH,
          metadata: { 
            email: user.email,
            attemptId: loginAttemptId,
            reason: 'EMAIL_NOT_VERIFIED',
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown'
          },
          details: { message: 'Login failed: Email not verified' },
          status: 'FAILED'
        });
        
        throw new EmailNotVerifiedError({ userId: user.id, attemptId: loginAttemptId });
      }
      
      // Reset failed login attempts on successful login
      await prisma.$transaction(async (tx) => {
        // Reset failed login attempts
        if (user.failedLoginAttempts > 0) {
          await tx.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0 }
          });
        }
        
        // Log successful login
        await tx.activityLog.create({
          data: {
            userId: user.id,
            type: 'LOGIN_SUCCESS',
            action: 'LOGIN_SUCCESS',
            ipAddress: ip || null,
            userAgent: userAgent || null,
            metadata: JSON.stringify({
              attemptId: loginAttemptId
            })
          }
        });
      });
      
      // Generate tokens
      const accessToken = await TokenService.generateToken(
        user.id, 
        user.email, 
        user.role
      );
      const refreshToken = await RefreshTokenService.generateRefreshToken(
        user.id, 
        uuidv4() // Generate a session ID
      );
      
      // Log successful login
      securityLogger.info('Login successful', {
        userId: user.id,
        email: user.email,
        attemptId: loginAttemptId,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown'
      });
      
      await AuditService.log({
        userId: user.id,
        action: 'user_login_success', // Using string literal instead of enum
        type: AuditLogType.AUTH,
        metadata: { 
          email: user.email,
          attemptId: loginAttemptId,
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        },
        details: { message: 'Login successful' },
        status: 'SUCCESS'
      });
      
      // Calculate token expiration
      const expiresAt = Date.now() + (this.SESSION_DURATION_HOURS * 60 * 60 * 1000);
      const sessionId = uuidv4(); // Generate a session ID
      
      // Return auth result
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || '', // Ensure name is not null
          role: this.validateUserRole(user.role)
        },
        accessToken,
        refreshToken,
        expiresAt,
        sessionId
      };
    } catch (error) {
      // Log any unexpected errors
      if (!(error instanceof InvalidCredentialsError) && 
          !(error instanceof AccountLockedError) && 
          !(error instanceof AccountDisabledError) && 
          !(error instanceof EmailNotVerifiedError)) {
        
        securityLogger.error('Login failed: Unexpected error', {
          email,
          attemptId: loginAttemptId,
          error: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          ip: ip || 'unknown',
          userAgent: userAgent || 'unknown'
        });
        
        await AuditService.log({
          userId: 'anonymous',
          action: 'user_login_failed',
          type: AuditLogType.AUTH,
          metadata: { 
            email,
            attemptId: loginAttemptId,
            reason: 'UNEXPECTED_ERROR',
            error: error instanceof Error ? error.message : String(error),
            ip: ip || 'unknown',
            userAgent: userAgent || 'unknown'
          },
          details: { message: 'Login failed: Unexpected error' },
          status: 'FAILED' // Changed from 'ERROR' to 'FAILED'
        });
      }
      
      throw error;
    }
  }

  /**
   * Validates if a role is a valid UserRole and returns it
   * Falls back to default role if invalid
   * 
   * @param role - Role to validate
   * @returns Valid UserRole
   */
  private static validateUserRole(role: unknown): UserRole {
    // Use the centralized type guard
    if (isValidUserRole(role)) {
      return role;
    }
    
    // Default to USER role if invalid
    return UserRole.USER;
  }
} 