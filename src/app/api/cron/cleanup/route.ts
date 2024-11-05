import { NextResponse } from 'next/server';
import { cleanupExpiredSessions } from '@/lib/auth/sessionCleanup';

export async function GET() {
  try {
    const cleanedCount = await cleanupExpiredSessions();
    return NextResponse.json({ cleanedCount });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to cleanup sessions' },
      { status: 500 }
    );
  }
} 