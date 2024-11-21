import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { z } from 'zod';

const disableSchema = z.object({
  code: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = disableSchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // First delete all backup codes
    await prisma.backupCode.deleteMany({
      where: { userId: session.user.id }
    });

    // Then update user
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    return NextResponse.json({
      message: '2FA disabled successfully',
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { message: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
