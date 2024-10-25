import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { authenticator } from 'otplib';
import { z } from 'zod';

const verifySchema = z.object({
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
    const { code } = verifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { message: '2FA not set up' },
        { status: 400 }
      );
    }

    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({
      message: '2FA enabled successfully',
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Failed to verify 2FA code' },
      { status: 500 }
    );
  }
}
