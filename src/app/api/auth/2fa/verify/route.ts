import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().length(6)
});

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  try {
    // Check rate limit
    const ip = _req.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`2fa_verify_${ip}`);

    if (!rateLimitResult.success) {
      return createErrorResponse('Too many attempts. Please try again later.', 'RATE_LIMIT_EXCEEDED', 429);
    }

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return createErrorResponse('Unauthorized', 'UNAUTHORIZED', 401);
    }

    const body = await _req.json();
    const { token } = verifySchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(
      session.user.id,
      token
    );

    if (!isValid) {
      return createErrorResponse('Invalid verification code', 'INVALID_CODE', 400);
    }

    // Get session ID from headers
    const sessionId = _req.headers.get('x-session-id');
    if (!sessionId) {
      return createErrorResponse('Session ID required', 'MISSING_SESSION_ID', 400);
    }

    // Mark session as 2FA verified
    await TwoFactorService.markSessionVerified(
      sessionId,
      session.user.id,
      _req.headers.get('x-forwarded-for') || undefined,
      _req.headers.get('user-agent') || undefined
    );

    // Track session
    await SessionTrackingService.trackSession({
      sessionId,
      userId: session.user.id,
      ip: _req.headers.get('x-forwarded-for') || undefined,
      userAgent: _req.headers.get('user-agent') || undefined
    });

    return createSuccessResponse({
      success: true,
      message: 'Two-factor authentication verified'
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    
    if (error instanceof z.ZodError) {
      return createErrorResponse('Invalid code format', 'VALIDATION_ERROR', 400);
    }
    
    return createErrorResponse('Verification failed', 'SERVER_ERROR', 500);
  }
}
