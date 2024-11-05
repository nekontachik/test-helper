import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { sendPasswordResetEmail } from '@/lib/utils/email';
import { generateToken } from '@/lib/utils/token';

const requestSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const { email } = requestSchema.parse(await request.json());
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent');

    // Check rate limit
    await SecurityService.checkBruteForce(ip, 'password');

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true },
    });

    if (user) {
      const token = await generateToken();
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expires,
        },
      });

      await sendPasswordResetEmail(user.email, user.name || 'User', token);
      await ActivityService.log(user.id, 'PASSWORD_RESET_REQUESTED', {
        ip,
        userAgent,
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 