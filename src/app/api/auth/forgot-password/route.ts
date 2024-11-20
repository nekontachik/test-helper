import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenService, TokenType } from '@/lib/auth/tokens/tokenService';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { z } from 'zod';
import logger from '@/lib/logger';

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      // Return success even if user doesn't exist for security
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent.',
      });
    }

    const token = await TokenService.generateToken({
      type: TokenType.PASSWORD_RESET,
      userId: user.id,
      email: user.email
    });

    await sendPasswordResetEmail(user.email, user.name || 'User', token);

    logger.info('Password reset requested', { userId: user.id });

    return NextResponse.json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    logger.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
