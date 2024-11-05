import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sessions = await SessionService.getUserSessions(session.user.id);

    return NextResponse.json({
      sessions: sessions.map(session => ({
        id: session.id,
        userAgent: session.userAgent,
        lastActive: session.lastActive,
        deviceInfo: session.deviceInfo,
      })),
    });
  } catch (error) {
    console.error('Session fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await SessionService.terminateAllSessions(session.user.id, session.id);

    return NextResponse.json({
      message: 'All other sessions terminated',
    });
  } catch (error) {
    console.error('Session termination error:', error);
    return NextResponse.json(
      { error: 'Failed to terminate sessions' },
      { status: 500 }
    );
  }
}
