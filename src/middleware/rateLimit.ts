import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors';
import logger from '@/lib/logger';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const defaultConfig: RateLimitConfig = {
  maxRequests: 100, // requests
  windowMs: 60 * 1000, // 1 minute
};

export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig = defaultConfig
) {
  const ip = request.ip ?? '127.0.0.1';
  const key = `rate-limit:${ip}`;

  const currentRequests = await redis.incr(key);
  
  if (currentRequests === 1) {
    await redis.expire(key, config.windowMs / 1000);
  }

  if (currentRequests > config.maxRequests) {
    return new NextResponse(null, {
      status: 429,
      statusText: 'Too Many Requests',
      headers: {
        'Retry-After': String(config.windowMs / 1000),
      },
    });
  }

  return null;
}

export function withRateLimit(handler: Function, key: string, options: RateLimitConfig = defaultConfig) {
  return async function rateLimitHandler(request: Request, ...args: any[]) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const identifier = `${key}:${ip}`;
    
    const current = await redis.incr(identifier);
    
    if (current === 1) {
      await redis.expire(identifier, options.windowMs / 1000);
    }

    if (current > options.maxRequests) {
      const ttl = await redis.ttl(identifier);
      throw new RateLimitError('Too many requests', ttl);
    }

    return handler(request, ...args);
  };
}