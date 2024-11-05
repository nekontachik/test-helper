import { NextResponse } from 'next/server';
import { authRateLimitMiddleware } from '@/middleware/authRateLimit';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function POST(request: Request) {
  // Apply rate limiting
  const rateLimit = await authRateLimitMiddleware(request);
  if (rateLimit instanceof Response) return rateLimit;

  try {
    const { email, password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const userAgent = request.headers.get('user-agent');

    // Check for breached password
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      await ActivityService.log('UNKNOWN', 'LOGIN_FAILED', {
        ip,
        userAgent,
        metadata: { reason: 'breached_password' },
      });
      return NextResponse.json(
        { error: 'This password has been compromised in a data breach' },
        { status: 400 }
      );
    }

    // Record the attempt
    await SecurityService.recordFailedAttempt(ip);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
} 