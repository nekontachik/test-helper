import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`verify_email_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { token } = verifySchema.parse(body);

    await AuthService.verifyEmail(token);

    return NextResponse.json({
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Verification failed' },
      { status: 400 }
    );
  }
}