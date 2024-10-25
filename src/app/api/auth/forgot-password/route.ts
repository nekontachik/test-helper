import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePasswordResetToken } from '@/lib/tokens';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { z } from 'zod';

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

    const token = await generatePasswordResetToken(user.email);
    await sendPasswordResetEmail(user.email, user.name || 'User', token);

    return NextResponse.json({
      message: 'Password reset email sent successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
}
