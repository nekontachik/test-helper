import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { RateLimitError } from '@/lib/errors';
import logger from '@/lib/logger';

interface RateLimitOptions {
  points: number;
  duration: number;
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
    const rateLimiter = new RateLimiter();
    const ip = params.request.headers.get('x-forwarded-for') || 'unknown';

    await rateLimiter.checkLimit(ip.toString(), params);
    return { success: true };
  } catch (error) {
    if (error instanceof RateLimitError) {
      logger.warn('Rate limit exceeded:', {
        ip: params.request.headers.get('x-forwarded-for'),
        path: params.request.url,
      });

      return { success: false, retryAfter: error.resetIn };
    }

    logger.error('Rate limit middleware error:', error);
    return { success: false };
  }
}

export function createRateLimiter() {
  return new RateLimiter();
}