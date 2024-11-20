import { Redis } from '@upstash/redis';

export interface RateLimitConfig {
  points: number;
  duration: number; // in seconds
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

export class RateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN!,
    });
  }

  async checkLimit(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const { points, duration } = config;
    const now = Date.now();
    const clearBefore = now - duration * 1000;

    const keyPrefix = `ratelimit:${key}`;
    const requestsKey = `${keyPrefix}:requests`;
    const timestampKey = `${keyPrefix}:timestamp`;

    // Get current count and last request timestamp
    const [count, lastTimestamp] = await Promise.all([
      this.redis.get<number>(requestsKey),
      this.redis.get<number>(timestampKey)
    ]);

    // Reset if expired
    if (!count || !lastTimestamp || lastTimestamp < clearBefore) {
      await Promise.all([
        this.redis.set(requestsKey, 1),
        this.redis.set(timestampKey, now),
        this.redis.expire(requestsKey, duration),
        this.redis.expire(timestampKey, duration)
      ]);

      return {
        success: true,
        limit: points,
        remaining: points - 1,
        reset: now + duration * 1000
      };
    }

    // Check if limit exceeded
    if (count >= points) {
      return {
        success: false,
        limit: points,
        remaining: 0,
        reset: lastTimestamp + duration * 1000
      };
    }

    // Increment count
    await this.redis.incr(requestsKey);

    return {
      success: true,
      limit: points,
      remaining: points - (count + 1),
      reset: lastTimestamp + duration * 1000
    };
  }

  async recordFailedAttempt(key: string, type: string): Promise<void> {
    const keyPrefix = `ratelimit:${key}:${type}`;
    const attemptsKey = `${keyPrefix}:attempts`;
    const timestampKey = `${keyPrefix}:timestamp`;
    const now = Date.now();

    await Promise.all([
      this.redis.incr(attemptsKey),
      this.redis.set(timestampKey, now),
      this.redis.expire(attemptsKey, 3600), // 1 hour
      this.redis.expire(timestampKey, 3600)
    ]);
  }

  async resetAttempts(key: string, type: string): Promise<void> {
    const keyPrefix = `ratelimit:${key}:${type}`;
    await Promise.all([
      this.redis.del(`${keyPrefix}:attempts`),
      this.redis.del(`${keyPrefix}:timestamp`)
    ]);
  }
} 