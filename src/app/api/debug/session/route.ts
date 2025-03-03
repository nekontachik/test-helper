import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Debug session endpoint called');
    
    // Get the current session
    const session = await getServerSession(authOptions);
    
    // Create a safe version of the session for logging
    const safeSession = session ? {
      expires: session.expires,
      user: session.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        // Redact sensitive fields
        image: session.user.image ? '[REDACTED]' : null,
      } : null,
      // Add any other session fields that are safe to log
    } : null;
    
    // Get cookies for debugging (redact sensitive values)
    const cookies = Object.fromEntries(
      Array.from(req.cookies.getAll()).map(cookie => [
        cookie.name,
        cookie.name.toLowerCase().includes('token') || 
        cookie.name.toLowerCase().includes('session') || 
        cookie.name.toLowerCase().includes('auth')
          ? '[REDACTED]' 
          : cookie.value
      ])
    );
    
    return NextResponse.json({
      status: 'success',
      message: 'Session debug information',
      hasSession: !!session,
      session: safeSession,
      cookies,
    });
  } catch (error) {
    logger.error('Error in session debug endpoint', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 