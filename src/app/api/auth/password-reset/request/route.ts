import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TokenService } from '@/lib/auth/tokenService';
import { sendPasswordResetEmail } from '@/lib/emailService';
import { z } from 'zod';

const requestSchema = z.object({
  email: z.string().email() });

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const body = await _req.json();
    const { email } = requestSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true } });

    if (!user) {
      // Return success even if user doesn't exist (security)
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent.'
      });
    }

    const token = await TokenService.generatePasswordResetToken(user.email);
    await sendPasswordResetEmail(user.email, user.name || 'User', token);

    return NextResponse.json({
      message: 'Password reset email sent successfully'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
