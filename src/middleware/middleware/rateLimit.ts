import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '15 m'), // 100 requests per 15 minutes
      analytics: true,
      prefix: 'app:ratelimit',
    })
  : null;

export async function rateLimitMiddleware(request: NextRequest): Promise<NextResponse> {
  if (!ratelimit) {
    return NextResponse.next();
  }

  const ip = request.ip ?? '127.0.0.1';
  const { success, limit, reset, remaining, ..._rest } = await ratelimit.limit(
    `ratelimit_${ip}`
  );

  if (!success) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  const response = NextResponse.next();

  // Add rate limit info to response headers
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', reset.toString());

  return response;
}
