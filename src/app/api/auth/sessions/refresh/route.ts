import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const sessionId = request.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { message: 'Session ID not provided' },
        { status: 400 }
      );
    }

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Update session activity and extend expiry
    await SessionService.updateSessionActivity(sessionId);

    return NextResponse.json({
      message: 'Session refreshed successfully',
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { message: 'Failed to refresh session' },
      { status: 500 }
    );
  }
}
