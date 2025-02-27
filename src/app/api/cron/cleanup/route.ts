import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function GET(_req: NextRequest): Promise<Response> {
  try {
    await SessionTrackingService.cleanupExpiredSessions();
    
    return NextResponse.json({ success: true, message: 'Session cleanup completed successfully' });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
}
