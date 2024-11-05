import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/authService';
import { withRateLimit } from '@/middleware/rateLimit';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string(),
});

async function handler(request: Request) {
  try {
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

export const POST = withRateLimit(handler, 'auth:verify');