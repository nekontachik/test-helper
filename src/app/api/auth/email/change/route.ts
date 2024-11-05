import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { sendEmailChangeVerification } from '@/lib/utils/email';
import { generateToken } from '@/lib/utils/token';
import { authOptions } from '../../[...nextauth]/route';

const emailChangeSchema = z.object({
  newEmail: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { newEmail, password } = emailChangeSchema.parse(
      await request.json()
    );

    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent');

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, password: true },
    });

    if (!user || !await SecurityService.verifyPassword(password, user.password)) {
      await ActivityService.log(session.user.id, 'EMAIL_CHANGE_FAILED', {
        ip,
        userAgent,
        metadata: { reason: 'invalid_password' },
      });
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 400 }
      );
    }

    // Check if new email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already in use' },
        { status: 400 }
      );
    }

    const token = await generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        newEmail: newEmail,
        emailChangeToken: token,
        emailChangeTokenExpiry: expires,
      },
    });

    await sendEmailChangeVerification(newEmail, token);
    await ActivityService.log(session.user.id, 'EMAIL_CHANGE_REQUESTED', {
      ip,
      userAgent,
      metadata: { newEmail },
    });

    return NextResponse.json({
      message: 'Verification email sent to new address',
    });
  } catch (error) {
    console.error('Email change request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 