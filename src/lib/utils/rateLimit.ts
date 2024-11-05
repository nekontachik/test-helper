import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// Create Redis instance
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL || '',
  token: process.env.UPSTASH_REDIS_TOKEN || '',
})

// Create rate limiters for different actions
export const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 attempts per 5 minutes
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
  
  // More strict limit for failed attempts
  failedAuth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '15 m'), // 3 attempts per 15 minutes
    analytics: true,
    prefix: 'ratelimit:failed-auth',
  }),
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly resetIn: number
  ) {
    super(message)
    this.name = 'RateLimitError'
  }
}

export async function checkRateLimit(
  identifier: string,
  limiter: keyof typeof rateLimiters
) {
  const result = await rateLimiters[limiter].limit(identifier)
  
  if (!result.success) {
    throw new RateLimitError(
      `Too many requests. Please try again in ${result.reset} seconds.`,
      result.reset
    )
  }
  
  return result
} 