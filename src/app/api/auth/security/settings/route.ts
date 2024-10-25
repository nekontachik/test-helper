import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SecurityService } from '@/lib/auth/securityService';
import { z } from 'zod';

const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().optional(),
  sessionTimeout: z.number().min(5).max(60).optional(), // minutes
  allowMultipleSessions: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        twoFactorEnabled: true,
        lastLoginAt: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    const activeSessions = await SessionService.getUserSessions(session.user.id);

    return NextResponse.json({
      ...settings,
      activeSessions: activeSessions.length,
    });
  } catch (error) {
    console.error('Security settings fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch security settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const settings = securitySettingsSchema.parse(body);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: settings,
      select: {
        twoFactorEnabled: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Security settings update error:', error);
    return NextResponse.json(
      { message: 'Failed to update security settings' },
      { status: 500 }
    );
  }
}
