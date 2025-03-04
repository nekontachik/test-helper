import type { NextRequest } from 'next/server';
import logger from '@/lib/logger';
import { securityLogger } from '@/lib/utils/securityLogger';
import { createErrorResponse, ErrorType } from '@/lib/utils/errorResponse';
import { MIDDLEWARE_CONFIG } from '../config';

/**
 * Rate limiting middleware module
 */
export class RateLimitMiddleware {
  /**
   * Apply rate limiting to a request
   */
  public static async applyRateLimit(
    request: NextRequest, 
    pathname: string
  ): Promise<Response | undefined> {
    try {
      // Import rate limiter dynamically
      const { rateLimiters } = await import('@/lib/utils/rateLimit');
      
      // Get rate limit config for this path
      const rateLimitConfig = Object.entries(MIDDLEWARE_CONFIG.rateLimits).find(
        ([pattern]) => new RegExp(`^${pattern}$`).test(pathname)
      )?.[1];

      if (!rateLimitConfig) return undefined;

      const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const identifier = `${ip}:${pathname}`;
      
      const limiter = rateLimiters.auth;
      const { success, limit, reset } = await limiter.limit(identifier);

      if (!success) {
        securityLogger.warn('Rate limit exceeded', {
          path: pathname,
          ip,
          userAgent: request.headers.get('user-agent') || 'unknown',
          limit,
          reset
        });

        return createErrorResponse({
          status: 429,
          type: ErrorType.RATE_LIMIT,
          message: 'Too many requests',
          details: {
            limit,
            reset
          }
        });
      }

      return undefined;
    } catch (error) {
      logger.error('Rate limit error:', {
        error: error instanceof Error ? error.message : String(error),
        path: pathname
      });
      return undefined; // Continue if rate limiting fails
    }
  }
} 