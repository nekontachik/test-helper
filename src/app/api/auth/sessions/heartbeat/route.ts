import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionManager } from '@/lib/auth/session/sessionManager';

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await SessionManager.updateSessionActivity(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Session activity updated'
    });
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session activity' },
      { status: 500 }
    );
  }
}
