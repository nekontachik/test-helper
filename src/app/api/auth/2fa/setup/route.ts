import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { generateTOTPConfig, verifyTOTP } from '@/lib/utils/totp';
import { authOptions } from '../../[...nextauth]/route';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function POST(request: Request) {
  // Initialize 2FA setup
  // Generate and return QR code
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: AUTH_ERRORS.SESSION_REQUIRED },
        { status: 401 }
      );
    }

    const { token } = await request.json();
    if (!token) {
      return NextResponse.json(
        { error: 'Verification code is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    });

    if (!user?.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA setup not initiated' },
        { status: 400 }
      );
    }

    const isValid = verifyTOTP(token, user.twoFactorSecret);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
}
