import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { z } from 'zod';

const validateSchema = z.object({
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
    const { code } = validateSchema.parse(body);

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid code' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Code validated successfully',
    });
  } catch (error) {
    console.error('2FA validation error:', error);
    return NextResponse.json(
      { message: 'Failed to validate code' },
      { status: 500 }
    );
  }
}
