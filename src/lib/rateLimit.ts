import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import type { NextApiRequest, NextApiResponse } from 'next';

// Configure Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Create a new ratelimiter, that allows 5 requests per 5 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '5 s'),
});

const rateLimitMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => Promise<void>
): Promise<void> => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { success } = await ratelimit.limit(ip as string);

  if (!success) {
    res.status(429).json({ message: 'Too Many Requests' });
    return;
  }

  await next();
};

export default rateLimitMiddleware;
