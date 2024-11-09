import { NextResponse } from 'next/server';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';

export async function GET() {
  try {
    await SessionTrackingService.cleanupExpiredSessions();
    
    return NextResponse.json({
      message: 'Session cleanup completed successfully'
    });
  } catch (error) {
    console.error('Session cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
} 