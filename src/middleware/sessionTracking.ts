import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { SessionTrackingService } from '@/lib/auth/sessionTrackingService';
import type { JWT } from 'next-auth/jwt';

export async function sessionTrackingMiddleware(request: Request) {
  try {
    const token = await getToken({ req: request as any }) as JWT & { jti: string };
    
    if (!token?.sub || !token?.jti) {
      return NextResponse.next();
    }

    // Track session activity
    await SessionTrackingService.trackSession({
      sessionId: token.jti,
      userId: token.sub,
      ip: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.next();
  } catch (error) {
    console.error('Session tracking error:', error);
    // Don't block the request if session tracking fails
    return NextResponse.next();
  }
}

export function withSessionTracking(handler: Function) {
  return async function(request: Request) {
    await sessionTrackingMiddleware(request);
    return handler(request);
  };
} 