import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Clean up expired sessions
    const result = await SessionService.cleanupExpiredSessions(session.user.id);

    return NextResponse.json({
      message: `Cleaned up ${result.count} expired sessions`,
      count: result.count,
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { message: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
