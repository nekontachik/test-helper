import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import logger from '@/lib/logger';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (req: NextRequest) => string;
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per windowMs
  keyGenerator: (req) => req.ip || 'anonymous'
};

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const limiter = new RateLimiter();

  return async function (request: NextRequest) {
    try {
      const key = opts.keyGenerator(request);
      const { success, limit, remaining, reset } = await limiter.checkLimit(key, {
        points: opts.max,
        duration: opts.windowMs / 1000 // Convert to seconds
      });

      // Set rate limit headers
      const response = success ? NextResponse.next() : 
        NextResponse.json(
          { error: 'Too many requests' },
          { status: 429 }
        );

      response.headers.set('X-RateLimit-Limit', limit.toString());
      response.headers.set('X-RateLimit-Remaining', remaining.toString());
      response.headers.set('X-RateLimit-Reset', reset.toString());

      if (!success) {
        logger.warn('Rate limit exceeded', {
          ip: key,
          path: request.nextUrl.pathname,
          userAgent: request.headers.get('user-agent')
        });
      }

      return response;
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      return NextResponse.next();
    }
  };
} 