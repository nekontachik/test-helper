import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Create a new ratelimiter that allows 10 requests per 10 seconds
const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function checkRateLimit(identifier: string) {
  const { success, limit, reset, remaining } = await authLimiter.limit(identifier);

  return {
    success,
    limit,
    reset,
    remaining,
  };
}

export async function getRateLimitInfo(identifier: string) {
  return authLimiter.limit(identifier);
}
