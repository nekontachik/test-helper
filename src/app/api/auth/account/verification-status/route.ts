import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/auth/rateLimit';

export async function GET(request: Request) {
  try {
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await checkRateLimit(`verification_status_${ip}`);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        sessions: {
          where: {
            expires: { gt: new Date() },
          },
          select: {
            id: true,
            lastActive: true,
            userAgent: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      emailVerified: !!user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      activeSessions: user.sessions.length,
      lastActive: user.sessions.length > 0 
        ? Math.max(...user.sessions.map(s => s.lastActive.getTime()))
        : null,
    });
  } catch (error) {
    console.error('Verification status error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
