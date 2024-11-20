import { NextResponse } from 'next/server';
import { withRateLimit } from '@/middleware/rateLimit';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/auth/tokens';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { AUTH_ERRORS } from '@/lib/utils/error';
import logger from '@/lib/logger';

const requestSchema = z.object({
  email: z.string().email(),
});

async function handler(request: Request) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true },
    });

    if (user) {
      const token = await generatePasswordResetToken(email);
      await sendPasswordResetEmail(email, user.name || 'User', token);
      
      logger.info('Password reset requested', { userId: user.id });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit(handler, 'password-reset'); 