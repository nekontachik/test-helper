import { type NextRequest, NextResponse } from 'next/server';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    // Verify that the request comes from a cron job or authorized source
    const authHeader = _req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await SessionTrackingService.cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      message: 'Session cleanup completed'
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
