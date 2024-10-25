import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const currentSessionId = request.headers.get('x-session-id');
    const activeSessions = await SessionService.getUserSessions(session.user.id);

    const formattedSessions = activeSessions.map(s => ({
      id: s.id,
      lastActive: s.lastActive,
      isCurrent: s.id === currentSessionId,
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt,
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Active sessions fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch active sessions' },
      { status: 500 }
    );
  }
}
