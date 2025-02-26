import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authRateLimitMiddleware } from '@/middleware/authRateLimit';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimit = await authRateLimitMiddleware(request);
  if (rateLimit instanceof Response) return rateLimit;

  try {
    const { email, password } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || undefined;
    const userAgent = request.headers.get('user-agent') || undefined;

    // Check for breached password
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
        ip,
        userAgent,
        metadata: { 
          reason: 'breached_password',
          email 
        },
      });
      return NextResponse.json(
        { error: 'This password has been compromised in a data breach' },
        { status: 400 }
      );
    }

    // Log the failed attempt
    await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
      ip,
      userAgent,
      metadata: { 
        reason: 'invalid_credentials',
        email 
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: AUTH_ERRORS.UNKNOWN },
      { status: 500 }
    );
  }
} 