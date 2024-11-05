import { NextResponse } from 'next/server';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function POST(request: Request) {
  try {
    // Verify that the request comes from a cron job or authorized source
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await SessionTrackingService.cleanupExpiredSessions();

    return NextResponse.json({
      message: 'Session cleanup completed',
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
