import { NextResponse } from 'next/server';
import { rateLimitMiddleware } from './rateLimit';
import { auditLogMiddleware } from './audit';
import { isNextApiRequest, convertRequestToBase } from '@/lib/utils';

export function withRateLimit(handler: Function) {
  return async function(request: Request) {
    try {
      const req = isNextApiRequest(request) 
        ? convertRequestToBase(request)
        : request;

      const rateLimitResult = await rateLimitMiddleware({
        request: req,
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

      return handler(request);
    } catch (error) {
      console.error('Rate limit error:', error);
      return NextResponse.json(
        { error: 'Rate limit exceeded' }, 
        { status: 429 }
      );
    }
  };
}

export function withAudit(handler: Function) {
  return async function(request: Request) {
    try {
      const req = isNextApiRequest(request) 
        ? convertRequestToBase(request)
        : request;

      await auditLogMiddleware({
        request: req,
        session: null, // You might want to get the session here if needed
        action: 'API_REQUEST',
        metadata: {
          method: req.method,
          path: req.url,
          ip: req.headers.get('x-forwarded-for'),
          userAgent: req.headers.get('user-agent')
        }
      });

      return handler(request);
    } catch (error) {
      console.error('Audit logging failed:', error);
      return handler(request);
    }
  };
}