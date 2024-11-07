import { NextResponse } from 'next/server';
import { csrfMiddleware } from './csrf';
import { securityHeaders } from './securityHeaders';
import { rateLimitMiddleware } from './rateLimit';
import { auditLogMiddleware } from './audit';

export async function securityMiddleware(request: Request) {
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
      if (csrfResponse && csrfResponse instanceof Response && csrfResponse.status !== 200) {
        return csrfResponse;
      }

      // Apply rate limiting
      const rateLimitResponse = await rateLimitMiddleware(request);
      if (rateLimitResponse && rateLimitResponse instanceof Response && rateLimitResponse.status !== 200) {
        return rateLimitResponse;
      }
    }

    // Log the request (audit logging)
    await auditLogMiddleware(request);

    return response;
  } catch (error) {
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Security check failed' },
      { status: 500 }
    );
  }
} 