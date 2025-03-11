import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ServerSessionManager } from '@/lib/auth/session/serverSessionManager';
import { logger } from '@/lib/logger';
import { AuditService } from '@/lib/audit/auditService';
import { AuditAction, AuditLogType } from '@/types/audit';
import { RefreshTokenService } from '@/lib/auth/tokens/refreshTokenService';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  try {
    const session = await getServerSession(authOptions);
    
    // Get the session ID from the request header
    const sessionId = request.headers.get('x-session-id');
    
    // If we have a session ID, invalidate it and revoke refresh tokens
    if (sessionId) {
      await ServerSessionManager.invalidateSession(sessionId);
      
      // Revoke all refresh tokens associated with this session
      await RefreshTokenService.revokeTokens({ sessionId });
    }
    
    // Log the logout with comprehensive audit information
    if (session?.user) {
      const userId = session.user.id as string;
      
      // Log to application logger
      logger.info('User logged out', { 
        userId,
        ip,
        sessionId
      });
      
      // Create detailed audit log
      await AuditService.log({
        userId,
        action: AuditAction.USER_LOGOUT,
        type: AuditLogType.AUTH,
        context: { ip, userAgent },
        metadata: { 
          sessionId,
          method: 'API'
        },
        details: { message: 'User logged out via API' },
        status: 'SUCCESS'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout failed', { error });
    
    // Log the failed logout attempt
    if (request.headers.get('x-user-id')) {
      const userId = request.headers.get('x-user-id') as string;
      
      await AuditService.log({
        userId,
        action: AuditAction.USER_LOGOUT,
        type: AuditLogType.AUTH,
        context: { ip, userAgent },
        metadata: { 
          errorMessage: (error as Error).message 
        },
        details: { message: 'Logout attempt failed' },
        status: 'FAILED'
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to logout' 
      },
      { status: 500 }
    );
  }
} 