import { NextResponse } from 'next/server';
import { csrfMiddleware } from './csrf';
import { securityHeaders } from './securityHeaders';
import { rateLimitMiddleware } from './rateLimit';
import { auditLogMiddleware } from './audit';

export async function securityMiddleware(request: Request): Promise<NextResponse> {
  try {
    // Skip security checks for static files and images
    if (request.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
      return NextResponse.next();
    }

    // Apply security headers to all requests
    const response = securityHeaders(request);

    // Skip CSRF and rate limiting for GET requests
    if (request.method !== 'GET') {
      // Apply CSRF protection
      const csrfResponse = await csrfMiddleware(request);
      if (csrfResponse && csrfResponse.status !== 200) {
        return csrfResponse;
      }

      // Apply rate limiting
      const rateLimitResult = await rateLimitMiddleware({
        request,
        points: 100,
        duration: 60
      });

      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'Retry-After': String(rateLimitResult.retryAfter ?? 60)
            }
          }
        );
      }
    }

    // Log the request (audit logging)
    await auditLogMiddleware({
      request,
      session: null, // You might want to get the session here if needed
      action: 'API_REQUEST',
      metadata: {
        method: request.method,
        path: request.url,
        ip: request.headers.get('x-forwarded-for'),
        userAgent: request.headers.get('user-agent')
      }
    });

    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    );
  }
} 