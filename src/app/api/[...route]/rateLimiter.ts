import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import logger from '@/lib/utils/logger';

interface RateLimitOptions {
  windowMs?: number;    // Time window in milliseconds
  max?: number;         // Max requests per window
  keyGenerator?: (req: NextRequest) => string;  // Function to generate unique keys
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 60 * 1000, // 1 minute
  max: 100,           // 100 requests per minute
  keyGenerator: (req: NextRequest) => {
    const ip = req.headers.get('x-forwarded-for') || 
               req.headers.get('x-real-ip') || 
               'unknown';
    const path = new URL(req.url).pathname;
    return `${ip}:${path}`;
  }
};

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime <= now) {
      delete store[key];
    }
  });
}, 60000); // Clean up every minute

export function withRateLimit(
  handler: (req: NextRequest) => Promise<Response>,
  options: RateLimitOptions = {}
) {
  const opts = { ...defaultOptions, ...options };

  return async (req: NextRequest): Promise<Response> => {
    try {
      const key = opts.keyGenerator(req);
      const now = Date.now();

      // Initialize or reset if window has passed
      if (!store[key] || store[key].resetTime <= now) {
        store[key] = {
          count: 0,
          resetTime: now + opts.windowMs
        };
      }

      // Increment request count
      store[key].count++;

      // Check if over limit
      if (store[key].count > opts.max) {
        logger.warn('Rate limit exceeded', {
          key,
          count: store[key].count,
          limit: opts.max,
          windowMs: opts.windowMs
        });

        return NextResponse.json(
          { error: 'Too many requests' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': opts.max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (store[key].resetTime / 1000).toString(),
              'Retry-After': ((store[key].resetTime - now) / 1000).toString()
            }
          }
        );
      }

      // Add rate limit headers
      const response = await handler(req);
      const headers = new Headers(response.headers);
      headers.set('X-RateLimit-Limit', opts.max.toString());
      headers.set('X-RateLimit-Remaining', (opts.max - store[key].count).toString());
      headers.set('X-RateLimit-Reset', (store[key].resetTime / 1000).toString());

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    } catch (error) {
      logger.error('Rate limit middleware error', { error });
      return handler(req);
    }
  };
} 