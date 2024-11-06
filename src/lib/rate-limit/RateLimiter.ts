import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors/RateLimitError';
import logger from '@/lib/logger';

interface RateLimitConfig {
  points: number;
  duration: number;
}

interface RateLimitInfo {
  resetIn: number;
  limit: number;
  remaining: number;
}

export class RateLimiter {
  private static redis: Redis;
  private static cache = new Map<string, { count: number; expires: number }>();
  private static CACHE_TTL = 1000; // 1 second cache TTL

  constructor() {
    if (!RateLimiter.redis) {
      RateLimiter.redis = new Redis({
        url: process.env.UPSTASH_REDIS_URL!,
        token: process.env.UPSTASH_REDIS_TOKEN!,
      });
    }
  }

  private getCachedValue(key: string): { count: number; expires: number } | undefined {
    const cached = RateLimiter.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached;
    }
    RateLimiter.cache.delete(key);
    return undefined;
  }

  private setCachedValue(key: string, count: number, expires: number): void {
    RateLimiter.cache.set(key, { count, expires });
  }

  async checkLimit(identifier: string, config: RateLimitConfig = { points: 100, duration: 60 }): Promise<void> {
    const key = `ratelimit:${identifier}`;
    
    try {
      // Check cache first
      const cached = this.getCachedValue(key);
      if (cached) {
        if (cached.count >= config.points) {
          const resetIn = cached.expires - Date.now();
          throw new RateLimitError('Rate limit exceeded', {
            resetIn,
            limit: config.points,
            remaining: 0
          });
        }
        return;
      }

      // If not in cache, check Redis
      const [count] = await RateLimiter.redis.pipeline()
        .incr(key)
        .expire(key, config.duration)
        .exec();

      const currentCount = count as number;

      // Cache the result
      this.setCachedValue(key, currentCount, Date.now() + (config.duration * 1000));

      if (currentCount > config.points) {
        const ttl = await RateLimiter.redis.ttl(key);
        throw new RateLimitError('Rate limit exceeded', {
          resetIn: ttl * 1000,
          limit: config.points,
          remaining: 0
        });
      }
    } catch (error) {
      if (error instanceof RateLimitError) {
        throw error;
      }
      logger.error('Rate limit check error:', error);
      throw new Error('Rate limit check failed');
    }
  }

  async reset(identifier: string): Promise<void> {
    const key = `ratelimit:${identifier}`;
    RateLimiter.cache.delete(key);
    await RateLimiter.redis.del(key);
  }

  // Clean up expired cache entries periodically
  private static cleanupCache(): void {
    const now = Date.now();
    // Convert Map entries to array before iterating
    Array.from(RateLimiter.cache.entries()).forEach(([key, value]) => {
      if (now >= value.expires) {
        RateLimiter.cache.delete(key);
      }
    });
  }

  // Start cache cleanup interval
  static {
    setInterval(() => this.cleanupCache(), 60000); // Clean every minute
  }
} 