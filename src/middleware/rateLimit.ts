import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors';
import logger from '@/lib/logger';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

interface RateLimitOptions {
  points?: number;
  duration?: number;
  identifier?: string;
}

interface RateLimitParams {
  request: Request;
  points: number;
  duration: number;
}

interface RateLimitResult {
  success: boolean;
  retryAfter?: number;
}

export async function rateLimitMiddleware(
  params: RateLimitParams
): Promise<RateLimitResult> {
  try {
    const ip = params.request.headers.get('x-forwarded-for') || 'unknown';
    const identifier = `ratelimit:${ip}`;
    
    const current = await redis.incr(identifier);
    
    if (current === 1) {
      await redis.expire(identifier, params.duration);
    }

    if (current > params.points) {
      const ttl = await redis.ttl(identifier);
      logger.warn('Rate limit exceeded:', {
        ip,
        path: params.request.url,
      });
      return { success: false, retryAfter: ttl };
    }

    return { success: true };
  } catch (error) {
    logger.error('Rate limit middleware error:', error);
    return { success: false };
  }
}

export function withRateLimit(handler: Function, key: string, options: RateLimitOptions = {}) {
  return async function rateLimitHandler(request: Request, ...args: any[]) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const identifier = options.identifier || `${key}:${ip}`;
    
    const current = await redis.incr(identifier);
    
    if (current === 1) {
      await redis.expire(identifier, options.duration || 60);
    }

    if (current > (options.points || 10)) {
      const ttl = await redis.ttl(identifier);
      throw new RateLimitError('Too many requests', ttl);
    }

    return handler(request, ...args);
  };
}