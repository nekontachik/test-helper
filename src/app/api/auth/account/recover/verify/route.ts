import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/auth/tokenService';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const verifySchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, newPassword } = verifySchema.parse(body);

    const user = await TokenService.validateRecoveryToken(token);

    if (!user) {
      return NextResponse.json(
        { message: 'Invalid or expired recovery token' },
        { status: 400 }
      );
    }

    // Update password and clear recovery token
    const hashedPassword = await SecurityService.hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        recoveryToken: null,
        recoveryTokenExpiry: null,
      },
    });

    return NextResponse.json({
      message: 'Account recovered successfully',
    });
  } catch (error) {
    console.error('Account recovery verification error:', error);
    return NextResponse.json(
      { message: 'Failed to recover account' },
      { status: 500 }
    );
  }
}
