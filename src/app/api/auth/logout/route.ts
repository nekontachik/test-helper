import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerSessionManager } from '@/lib/auth/session/serverSessionManager';
import logger from '@/lib/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    
    // Get the session ID from the request header
    const sessionId = request.headers.get('x-session-id');
    
    // If we have a session ID, invalidate it
    if (sessionId) {
      await ServerSessionManager.invalidateSession(sessionId);
    }
    
    // Log the logout
    if (session?.user) {
      logger.info('User logged out', { 
        userId: session.user.id,
        ip: request.headers.get('x-forwarded-for') || request.ip || 'unknown'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout failed', { error });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to logout' 
      },
      { status: 500 }
    );
  }
} 