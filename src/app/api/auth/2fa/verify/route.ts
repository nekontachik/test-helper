import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';
import { withRateLimit } from '@/middleware/rateLimit';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().length(6),
});

async function handler(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { token } = verifySchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(
      session.user.id,
      token
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Mark session as 2FA verified
    await TwoFactorService.markSessionVerified(
      session.id,
      session.user.id,
      request.headers.get('x-forwarded-for') || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Track session
    await SessionTrackingService.trackSession({
      sessionId: session.id,
      userId: session.user.id,
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication verified',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, 'auth:2fa');
