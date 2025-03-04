import { z } from 'zod';
import { AuthService } from './authService';
import { AuditService } from '../audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import logger from '../logger';
import { checkRateLimit } from './rateLimit';

// Constants
const ANONYMOUS_USER_ID = 'anonymous';

// Validation schema
export const verifyEmailSchema = z.object({
  token: z.string()
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

interface VerificationContext {
  ip: string;
  userAgent: string;
  attemptId: string;
}

// User interface for verification response
interface VerifiedUser {
  id?: string;
  email?: string;
  [key: string]: unknown;
}

export class EmailVerificationService {
  /**
   * Check rate limit for email verification
   */
  static async checkRateLimit(ip: string): Promise<{ success: boolean; message?: string }> {
    const rateLimitResult = await checkRateLimit(`verify_email_${ip}`);
    
    if (!rateLimitResult.success) {
      logger.warn('Email verification rate limit exceeded', { ip });
      return { 
        success: false, 
        message: 'Too many verification attempts' 
      };
    }
    
    return { success: true };
  }

  /**
   * Log rate limit exceeded
   */
  static async logRateLimitExceeded(context: VerificationContext): Promise<void> {
    await AuditService.log({
      userId: ANONYMOUS_USER_ID,
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      type: AuditLogType.AUTH,
      metadata: { 
        attemptId: context.attemptId,
        ip: context.ip,
        userAgent: context.userAgent,
        reason: 'rate_limit_exceeded'
      },
      details: { message: 'Too many verification attempts' },
      status: 'FAILED'
    });
  }

  /**
   * Log validation error
   */
  static async logValidationError(context: VerificationContext, errors: z.ZodError): Promise<void> {
    logger.warn('Email verification validation error', { 
      errors: errors.errors 
    });
    
    await AuditService.log({
      userId: ANONYMOUS_USER_ID,
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      type: AuditLogType.AUTH,
      metadata: { 
        attemptId: context.attemptId,
        ip: context.ip,
        userAgent: context.userAgent,
        reason: 'validation_error'
      },
      details: { 
        message: 'Invalid verification request',
        errors: errors.errors
      },
      status: 'FAILED'
    });
  }

  /**
   * Log verification attempt
   */
  static async logVerificationAttempt(context: VerificationContext, tokenProvided: boolean): Promise<void> {
    logger.info('Email verification attempt', { 
      ip: context.ip, 
      attemptId: context.attemptId,
      tokenProvided,
      timestamp: new Date().toISOString()
    });
    
    await AuditService.log({
      userId: ANONYMOUS_USER_ID,
      action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
      type: AuditLogType.AUTH,
      metadata: { 
        attemptId: context.attemptId,
        ip: context.ip,
        userAgent: context.userAgent,
        tokenProvided
      },
      details: { message: 'Email verification attempt initiated' },
      status: 'SUCCESS'
    });
  }

  /**
   * Log successful verification
   */
  static async logSuccessfulVerification(context: VerificationContext, user: VerifiedUser): Promise<void> {
    logger.info('Email verified successfully', { 
      userId: user.id ?? ANONYMOUS_USER_ID,
      timestamp: new Date().toISOString()
    });
    
    const successMetadata: Record<string, unknown> = {
      attemptId: context.attemptId,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString()
    };
    
    if (user.email) {
      successMetadata.email = user.email;
    }
    
    await AuditService.log({
      userId: user.id ?? ANONYMOUS_USER_ID,
      action: AuditAction.EMAIL_VERIFIED,
      type: AuditLogType.AUTH,
      metadata: successMetadata,
      details: { 
        message: 'Email verified successfully',
        verifiedAt: new Date().toISOString()
      },
      status: 'SUCCESS'
    });
  }

  /**
   * Log verification error
   */
  static async logVerificationError(
    context: VerificationContext, 
    error: unknown, 
    userId = ANONYMOUS_USER_ID
  ): Promise<void> {
    const errorDetails: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
    
    logger.error('Email verification error:', { 
      error, 
      ip: context.ip,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    await AuditService.log({
      userId,
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      type: AuditLogType.AUTH,
      metadata: { 
        attemptId: context.attemptId,
        ip: context.ip,
        userAgent: context.userAgent,
        ...errorDetails
      },
      details: { 
        message: 'Email verification failed',
        ...errorDetails
      },
      status: 'FAILED'
    });
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<{ success: boolean; user?: VerifiedUser; error?: Error }> {
    try {
      const user = await AuthService.verifyEmail(token) as VerifiedUser;
      
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object returned from verification');
      }
      
      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Verification failed') 
      };
    }
  }

  /**
   * Extract user ID from token
   */
  static async extractUserIdFromToken(token: string): Promise<string> {
    try {
      const user = await AuthService.verifyEmail(token);
      return user?.id || ANONYMOUS_USER_ID;
    } catch {
      return ANONYMOUS_USER_ID;
    }
  }
} 