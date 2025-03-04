import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { EmailVerificationService, verifyEmailSchema } from '@/lib/auth/emailVerificationService';

export async function POST(req: NextRequest): Promise<ApiResponse<unknown>> {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const attemptId = crypto.randomUUID();
  
  // Create context object for logging
  const context = { ip, userAgent, attemptId };
  
  try {
    // Check rate limit
    const rateLimitResult = await EmailVerificationService.checkRateLimit(ip);
    if (!rateLimitResult.success) {
      await EmailVerificationService.logRateLimitExceeded(context);
      return createErrorResponse('Too many requests', 'RATE_LIMIT_EXCEEDED', 429);
    }

    // Parse and validate request body
    const body = await req.json();
    const result = verifyEmailSchema.safeParse(body);
    
    if (!result.success) {
      await EmailVerificationService.logValidationError(context, result.error);
      return createErrorResponse('Invalid verification request', 'VALIDATION_ERROR', 400);
    }
    
    // Log verification attempt
    const { token } = result.data;
    await EmailVerificationService.logVerificationAttempt(context, !!token);

    // Verify email
    const verificationResult = await EmailVerificationService.verifyEmail(token);
    
    if (!verificationResult.success) {
      throw verificationResult.error || new Error('Verification failed');
    }
    
    // Log successful verification
    await EmailVerificationService.logSuccessfulVerification(context, verificationResult.user!);

    return createSuccessResponse({
      message: 'Email verified successfully'
    });
    
  } catch (error) {
    // Try to extract user ID from token if possible
    let userId = 'anonymous';
    try {
      const body = await req.json().catch(() => ({}));
      const parsedToken = verifyEmailSchema.safeParse(body);
      if (parsedToken.success) {
        userId = await EmailVerificationService.extractUserIdFromToken(parsedToken.data.token);
      }
    } catch {
      // If token extraction fails, keep the default userId
    }
    
    // Log verification error
    await EmailVerificationService.logVerificationError(context, error, userId);
    
    return createErrorResponse(
      error instanceof Error ? error.message : 'Verification failed',
      'VERIFICATION_ERROR',
      400
    );
  }
}
