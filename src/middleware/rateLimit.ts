import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors/RateLimitError';
import { logger } from '@/lib/utils/logger';

/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting using Redis as a store.
 * Tracks requests by IP and applies configurable limits.
 */

interface RateLimitConfig {
  /** Maximum number of requests allowed within duration */
  points: number;
  /** Duration window in seconds */
  duration: number;
  /** Optional prefix for Redis keys */
  prefix?: string;
}

interface RateLimitInfo {
  remaining: number;
  resetIn: number;
  limit: number;
}

class RateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      prefix: 'ratelimit',
      ...config,
    };
  }

  private getKey(identifier: string): string {
    return `${this.config.prefix}:${identifier}`;
  }

  async check(identifier: string): Promise<RateLimitInfo> {
    const key = this.getKey(identifier);
    const now = Math.floor(Date.now() / 1000);

    const [count] = await this.redis.pipeline()
      .incr(key)
      .expire(key, this.config.duration)
      .exec();

    const remaining = Math.max(0, this.config.points - (count as number));
    const resetIn = this.config.duration * 1000;

    if (remaining < 0) {
      throw new RateLimitError('Too many requests', {
        limit: this.config.points,
        remaining,
        resetIn,
      });
    }

    return {
      remaining,
      resetIn,
      limit: this.config.points,
    };
  }
}

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Default configuration
const DEFAULT_CONFIG: RateLimitConfig = {
  points: 100,
  duration: 60, // 1 minute
};

/**
 * Rate limiting middleware for Next.js Edge Runtime
 */
export async function rateLimitMiddleware(
  request: Request,
  config: Partial<RateLimitConfig> = {}
): Promise<Response> {
  try {
    const limiter = new RateLimiter(redis, {
      ...DEFAULT_CONFIG,
      ...config,
    });

    // Get client identifier (IP address)
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';

    // Check rate limit
    const result = await limiter.check(identifier);

    // Create response with rate limit headers
    const response = NextResponse.next();
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', String(result.limit));
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetIn / 1000)));

    return response;
  } catch (error) {
    // Handle rate limit errors
    if (error instanceof RateLimitError) {
      logger.warn('Rate limit exceeded', {
        error: error.message,
        identifier: request.headers.get('x-forwarded-for'),
      });

      return NextResponse.json(
        { 
          error: 'Too Many Requests',
          retryAfter: Math.ceil(error.info.resetIn / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(error.info.resetIn / 1000)),
            'X-RateLimit-Limit': String(error.info.limit),
            'X-RateLimit-Reset': String(Math.ceil(error.info.resetIn / 1000)),
          },
        }
      );
    }

    // Handle other errors
    logger.error('Rate limit middleware error', { error });
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * Usage Examples:
 * 
 * Basic Usage:
 * ```typescript
 * export default rateLimitMiddleware;
 * ```
 * 
 * With Custom Configuration:
 * ```typescript
 * export default function middleware(request: Request) {
 *   return rateLimitMiddleware(request, {
 *     points: 50,
 *     duration: 30,
 *   });
 * }
 * ```
 */