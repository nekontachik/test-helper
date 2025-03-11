import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { RefreshTokenService } from '@/lib/auth/tokens/refreshTokenService';
import { ErrorHandler } from '@/lib/errors/errorHandler';
import { logger } from '@/lib/logger';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';

// Rate limit configuration for token refresh attempts
const REFRESH_RATE_LIMIT = {
  points: 10,       // 10 attempts
  duration: 300     // in 5 minutes (300 seconds)
};

// Validation schema for refresh token
const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.ip || 
             'unknown';
  
  // Apply rate limiting
  const rateLimiter = new RateLimiter();
  const rateLimitKey = `refresh:${ip}`;
  const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, REFRESH_RATE_LIMIT);
  
  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded for token refresh', { 
      ip: ip.toString(),
      limit: rateLimitResult.limit,
      reset: new Date(rateLimitResult.reset).toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Too many refresh attempts', 
        message: 'Please try again later',
        retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': rateLimitResult.limit.toString(),
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult.reset.toString()
        }
      }
    );
  }
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = refreshSchema.parse(body);
    
    // Get client info for security logging
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Attempt to refresh the token with rotation
    const result = await RefreshTokenService.refreshAccessToken(validatedData.refreshToken);
    
    // Log successful token refresh
    logger.info('Token refresh successful', { 
      ip: ip.toString(),
      userAgent
    });
    
    // Return success response with new tokens
    return NextResponse.json({
      success: true,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    // Record failed attempt
    await rateLimiter.recordFailedAttempt(ip.toString(), 'refresh');
    
    logger.error('Token refresh failed', { 
      error,
      ip: ip.toString()
    });
    return ErrorHandler.handleApiError(error);
  }
} 