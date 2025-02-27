import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    })
  : null;

export const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
    })
  : null;

interface RateLimitResult {
  success: boolean;
  limit: number;
  reset: number;
  remaining: number;
}

export async function checkRateLimit(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { success: true, limit: 0, reset: 0, remaining: 0 };
  }
  
  const { success, limit, reset, remaining } = await ratelimit.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}

export async function getRateLimitInfo(identifier: string): Promise<RateLimitResult> {
  if (!ratelimit) {
    return { success: true, limit: 0, reset: 0, remaining: 0 };
  }
  
  return ratelimit.limit(identifier);
}
