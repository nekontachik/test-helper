import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { SessionService } from '@/lib/auth/sessionService';
import { TokenService } from '@/lib/auth/tokenService';

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

    const isValid = await SessionService.validateSession(sessionId, session.user.id);

    if (!isValid) {
      return NextResponse.json(
        { message: 'Invalid or expired session' },
        { status: 401 }
      );
    }

    // Generate new access token
    const accessToken = TokenService.generateJWT({
      userId: session.user.id,
      role: session.user.role,
      sessionId,
    });

    // Update session activity
    await SessionService.updateSessionActivity(sessionId);

    return NextResponse.json({
      accessToken,
      message: 'Token refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: 'Failed to refresh token' },
      { status: 500 }
    );
  }
}
