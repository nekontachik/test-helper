import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/emailService';
import { TokenService } from '@/lib/auth/tokenService';

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
      select: { emailVerified: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: 'Email already verified' },
        { status: 400 }
      );
    }

    // Generate new verification token
    const token = await TokenService.generateVerificationToken(user.email);
    await sendVerificationEmail(user.email, user.name || 'User');

    return NextResponse.json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Email verification resend error:', error);
    return NextResponse.json(
      { message: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}
