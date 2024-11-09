import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionManager } from '@/lib/auth/session/sessionManager';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await SessionManager.updateSessionActivity(session.user.id);

    return NextResponse.json({
      message: 'Session activity updated',
    });
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return NextResponse.json(
      { error: 'Failed to update session activity' },
      { status: 500 }
    );
  }
} 