import { type NextRequest, NextResponse } from 'next/server';
import { ServerSessionManager } from '@/lib/auth/session/serverSessionManager';
import logger from '@/lib/logger';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const sessionId = req.headers.get('x-session-id');

    if (!sessionId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Session ID not provided' 
        }, 
        { status: 400 }
      );
    }

    const isValid = await ServerSessionManager.validateSession(sessionId);

    if (!isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or expired session' 
        }, 
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        message: 'Session is valid'
      }
    });
  } catch (error) {
    logger.error('Session validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to validate session' 
      }, 
      { status: 500 }
    );
  }
}
