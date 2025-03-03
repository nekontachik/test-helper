import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { AuthService } from '@/lib/auth/authService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import logger from '@/lib/logger';

// Define a constant for anonymous user ID
const ANONYMOUS_USER_ID = 'anonymous';
const UNKNOWN_VALUE = 'unknown';

const verifySchema = z.object({
  token: z.string() 
});

export async function POST(req: NextRequest): Promise<ApiResponse<unknown>> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  // We'll use userAgent in the metadata for audit logs
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const attemptId = crypto.randomUUID();
  
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(`verify_email_${ip}`);

    if (!rateLimitResult.success) {
      // Log rate limit exceeded
      logger.warn('Email verification rate limit exceeded', { ip });
      
      // Create audit log for rate limit exceeded
      await AuditService.log({
        userId: ANONYMOUS_USER_ID,
        action: AuditAction.EMAIL_VERIFICATION_FAILED,
        type: AuditLogType.AUTH,
        metadata: { 
          attemptId,
          ip,
          userAgent,
          reason: 'rate_limit_exceeded'
        },
        details: { message: 'Too many verification attempts' },
        status: 'FAILED'
      });
      
      return createErrorResponse('Too many requests', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Parse and validate request body
    const body = await req.json();
    const result = verifySchema.safeParse(body);
    
    if (!result.success) {
      // Log validation error
      logger.warn('Email verification validation error', { 
        errors: result.error.errors 
      });
      
      // Create audit log for validation error
      await AuditService.log({
        userId: ANONYMOUS_USER_ID,
        action: AuditAction.EMAIL_VERIFICATION_FAILED,
        type: AuditLogType.AUTH,
        metadata: { 
          attemptId,
          ip,
          userAgent,
          reason: 'validation_error'
        },
        details: { 
          message: 'Invalid verification request',
          errors: result.error.errors
        },
        status: 'FAILED'
      });
      
      return createErrorResponse('Invalid verification request', 'VALIDATION_ERROR', 400);
    }
    
    try {
      const { token } = result.data;
      
      // Log verification attempt
      logger.info('Email verification attempt', { 
        ip, 
        attemptId,
        tokenProvided: !!token,
        timestamp: new Date().toISOString()
      });
      
      // Create audit log for verification attempt
      await AuditService.log({
        userId: ANONYMOUS_USER_ID,
        action: AuditAction.EMAIL_VERIFICATION_REQUESTED,
        type: AuditLogType.AUTH,
        metadata: { 
          attemptId,
          ip,
          userAgent,
          tokenProvided: true
        },
        details: { message: 'Email verification attempt initiated' },
        status: 'SUCCESS'
      });

      // Verify email
      const user = await AuthService.verifyEmail(token);
      
      // Validate user object
      if (!user || typeof user !== 'object') {
        throw new Error('Invalid user object returned from verification');
      }
      
      // Log successful verification with proper null checking
      logger.info('Email verified successfully', { 
        userId: user.id ?? ANONYMOUS_USER_ID,
        timestamp: new Date().toISOString()
      });
      
      // Create metadata object with proper typing
      const successMetadata: Record<string, unknown> = {
        attemptId,
        ip,
        userAgent,
        timestamp: new Date().toISOString()
      };
      
      // Only add email if it exists
      if (user.email) {
        successMetadata.email = user.email;
      }
      
      // Create audit log for successful verification with proper null handling
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

      return createSuccessResponse({
        message: 'Email verified successfully'
      });
    } catch (validationError) {
      logger.error('Token validation error:', validationError);
      // Handle validation error
      return createErrorResponse('Invalid verification request', 'VALIDATION_ERROR', 400);
    }
  } catch (error) {
    // Extract user ID from token if possible
    let userId = ANONYMOUS_USER_ID;
    try {
      if (result?.success && result.data.token) {
        const decodedToken = await AuthService.decodeVerificationToken(result.data.token);
        userId = decodedToken.userId || ANONYMOUS_USER_ID;
      }
    } catch {
      // If token decoding fails, keep the default userId
    }
    const errorDetails: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    };
    
    // Log verification error
    logger.error('Email verification error:', { 
      error, 
      ip,
      errorMessage: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Create audit log for failed verification
    await AuditService.log({
      userId,
      action: AuditAction.EMAIL_VERIFICATION_FAILED,
      type: AuditLogType.AUTH,
      metadata: { 
        attemptId,
        ip,
        userAgent,
        ...errorDetails
      },
      details: { 
        message: 'Email verification failed',
        ...errorDetails
      },
      status: 'FAILED'
    });
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Verification failed',
      'VERIFICATION_ERROR',
      400
    );
  }
}
