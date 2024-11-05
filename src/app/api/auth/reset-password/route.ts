import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPasswordResetToken } from '@/lib/auth/tokens';
import { SecurityService } from '@/lib/auth/securityService';
import { AUTH_ERRORS } from '@/lib/utils/error';

const resetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password } = resetSchema.parse(body);

    const payload = await verifyPasswordResetToken(token);
    if (!payload?.email) {
      return NextResponse.json(
        { error: AUTH_ERRORS.INVALID_TOKEN },
        { status: 400 }
      );
    }

    // Check if password has been breached
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      return NextResponse.json(
        { error: AUTH_ERRORS.PASSWORD_COMPROMISED },
        { status: 400 }
      );
    }

    const hashedPassword = await SecurityService.hashPassword(password);

    await prisma.user.update({
      where: { email: payload.email },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: 'Password reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // Complete password reset
}
