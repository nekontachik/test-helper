import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().length(6),
});

export async function POST(request: Request) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`2fa_validate_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = validateSchema.parse(body);

    const isValid = await SecurityService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid code' },
        { status: 400 }
      );
    }

    // Update session to mark 2FA as completed
    await prisma.session.update({
      where: { 
        id: request.headers.get('x-session-id') || undefined,
        userId: session.user.id,
      },
      data: { 
        twoFactorAuthenticated: true,
        lastActive: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Code validated successfully',
    });
  } catch (error) {
    console.error('2FA validation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid code format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Failed to validate code' },
      { status: 500 }
    );
  }
}
