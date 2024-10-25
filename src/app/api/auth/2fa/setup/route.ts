import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    });

    if (!user?.emailVerified) {
      return NextResponse.json(
        { message: 'Email must be verified before enabling 2FA' },
        { status: 400 }
      );
    }

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      session.user.email,
      'Test Management System',
      secret
    );

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        twoFactorEnabled: false,
      },
    });

    return NextResponse.json({
      secret,
      qrCodeUrl: otpauthUrl,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { message: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}
