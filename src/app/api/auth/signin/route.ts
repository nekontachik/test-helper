import { type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, type ApiResponse } from '@/types/api';
import { authRateLimitMiddleware } from '@/middleware/authRateLimit';
import { SecurityService } from '@/lib/auth/securityService';
import { ActivityService } from '@/lib/auth/activityService';
import { ActivityEventType } from '@/types/activity';
import { AUTH_ERRORS } from '@/lib/utils/error';

export async function POST(_req: NextRequest): Promise<ApiResponse<unknown>> {
  // Apply rate limiting
  const rateLimit = await authRateLimitMiddleware(request);
  if (rateLimit instanceof Response) return rateLimit;

  try {
    const { email, password } = await _req.json();
    const ip = _req.headers.get('x-forwarded-for') || undefined;
    const userAgent = _req.headers.get('user-agent') || undefined;

    // Check for breached password
    const isBreached = await SecurityService.checkPasswordBreached(password);
    if (isBreached) {
      await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
        ip,
        userAgent,
        metadata: { 
          reason: 'breached_password',
          email } });
      return createSuccessResponse({ error: 'This password has been compromised in a data breach' }, { status: 400 }; }

    // Log the failed attempt
    await ActivityService.log('UNKNOWN', ActivityEventType.LOGIN_FAILED, {
      ip,
      userAgent,
      metadata: { 
        reason: 'invalid_credentials',
        email } });
    
    return createSuccessResponse({ success: true }; } catch (error) {
    console.error('Sign in error:', error);
    return createSuccessResponse({ error: AUTH_ERRORS.UNKNOWN }, { status: 500 }; }
}
