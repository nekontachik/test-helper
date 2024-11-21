import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/auth/twoFactorService';
import { checkRateLimit } from '@/lib/auth/rateLimit';
import { z } from 'zod';

const validateSchema = z.object({
  code: z.string().length(6),
});

interface SessionDeviceInfo {
  twoFactorAuthenticated?: boolean;
  twoFactorAuthenticatedAt?: string;
  deviceId?: string;
  lastActivity?: string;
}

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

    const isValid = await TwoFactorService.verifyTOTP(session.user.id, code);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid code' },
        { status: 400 }
      );
    }

    // Get existing deviceInfo or create new
    const sessionId = request.headers.get('x-session-id');
    const existingSession = sessionId ? await prisma.session.findUnique({
      where: { id: sessionId },
      select: { deviceInfo: true }
    }) : null;

    const existingDeviceInfo: SessionDeviceInfo = existingSession?.deviceInfo 
      ? JSON.parse(existingSession.deviceInfo)
      : {};

    // Update session with deviceInfo
    await prisma.session.update({
      where: { 
        id: sessionId || undefined,
        userId: session.user.id,
      },
      data: { 
        lastActive: new Date(),
        deviceInfo: JSON.stringify({
          ...existingDeviceInfo,
          twoFactorAuthenticated: true,
          twoFactorAuthenticatedAt: new Date().toISOString(),
          deviceId: request.headers.get('x-device-id') || undefined,
          lastActivity: new Date().toISOString()
        })
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
