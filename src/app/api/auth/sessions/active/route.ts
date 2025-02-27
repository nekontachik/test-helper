import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

interface SessionData {
  id: string;
  lastActive: Date;
  deviceInfo: unknown;
  createdAt: Date;
}

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    const currentSessionId = _req.headers.get('x-session-id');
    const activeSessions = await SessionService.getUserSessions(session.user.id);

    const formattedSessions = activeSessions.map((s: SessionData) => ({
      id: s.id,
      lastActive: s.lastActive,
      isCurrent: s.id === currentSessionId,
      deviceInfo: s.deviceInfo,
      createdAt: s.createdAt 
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Active sessions fetch error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch active sessions', 'ERROR_CODE', 500),
      { status: 500 }
    );
  }
}
