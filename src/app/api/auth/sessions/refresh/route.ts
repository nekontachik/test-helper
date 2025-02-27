import { type NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        createErrorResponse('Unauthorized', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    const sessionId = _req.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        createErrorResponse('Session ID not provided', 'ERROR_CODE', 400),
        { status: 400 }
      );
    }

    const isValid = await SessionService.validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json(
        createErrorResponse('Invalid or expired session', 'ERROR_CODE', 401),
        { status: 401 }
      );
    }

    // Update session activity and extend expiry
    await SessionService.updateSessionActivity(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Session refreshed successfully'
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      createErrorResponse('Failed to refresh session', 'ERROR_CODE', 500),
      { status: 500 }
    );
  }
}
