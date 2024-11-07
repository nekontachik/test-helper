import { NextResponse } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { RateLimitError } from '@/lib/errors';
import logger from '@/lib/logger';

const rateLimiter = new RateLimiter();

export async function rateLimitMiddleware(request: Request): Promise<Response | void> {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const path = new URL(request.url).pathname;

    // Get rate limit config based on path
    let points = 100; // Default: 100 requests per minute
    let duration = 60;

    if (path.startsWith('/api/auth')) {
      points = 5; // 5 attempts per 5 minutes for auth routes
      duration = 300;
    } else if (path.startsWith('/api/admin')) {
      points = 50; // 50 requests per minute for admin routes
      duration = 60;
    }

    await rateLimiter.checkLimit(ip, { points, duration });
    return NextResponse.next();
  } catch (error) {
    if (error instanceof RateLimitError) {
      logger.warn('Rate limit exceeded', {
        ip: request.headers.get('x-forwarded-for'),
        path: new URL(request.url).pathname,
      });

      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(error.resetIn / 1000))
          }
        }
      );
    }

    logger.error('Rate limit middleware error:', error);
    return NextResponse.next();
  }
}

export function createRateLimiter() {
  return new RateLimiter();
}