import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create rate limiter instances for different endpoints
const authenticatedLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
  prefix: 'ratelimit:auth',
});

const publicLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), // 20 requests per minute
  analytics: true,
  prefix: 'ratelimit:public',
});

export async function rateLimiter(
  request: NextRequest,
  isAuthenticated: boolean = false
): Promise<NextResponse | null> {
  const ip = request.ip ?? '127.0.0.1';
  const limiter = isAuthenticated ? authenticatedLimiter : publicLimiter;

  try {
    const { success, limit, reset, remaining } = await limiter.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          limit,
          remaining,
          reset: new Date(reset).toISOString(),
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    return null;
  } catch (error) {
    console.error('Rate limiting error:', error);
    return null;
  }
} 