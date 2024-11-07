import { Redis } from '@upstash/redis';
import { RateLimitError } from '@/lib/errors';

export interface RateLimitConfig {
  points: number;
  duration: number;
}

export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  async checkLimit(identifier: string, config: RateLimitConfig): Promise<void> {
    const key = `ratelimit:${identifier}`;
    const attempts = await this.redis.get<number>(key);

    if (attempts && attempts >= config.points) {
      const ttl = await this.redis.ttl(key);
      throw new RateLimitError('Rate limit exceeded', ttl);
    }
  }

  async recordFailedAttempt(identifier: string, type: string): Promise<void> {
    const key = `ratelimit:${type}:${identifier}`;
    await this.redis.incr(key);
    await this.redis.expire(key, 300); // 5 minutes
  }

  async resetAttempts(identifier: string, type: string): Promise<void> {
    const key = `ratelimit:${type}:${identifier}`;
    await this.redis.del(key);
  }
} 