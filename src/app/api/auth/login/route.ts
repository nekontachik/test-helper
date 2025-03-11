import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/authService';
import { ErrorHandler } from '@/lib/errors/errorHandler';
import { logger } from '@/lib/logger';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';

// Rate limit configuration for login attempts
const LOGIN_RATE_LIMIT = {
  points: 5,        // 5 attempts
  duration: 300     // in 5 minutes (300 seconds)
};

// Validation schema for login credentials
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

// Add this function to create a test user
async function ensureTestUserExists(): Promise<void> {
  try {
    const testEmail = 'admin@example.com';
    const testPassword = 'Admin123!';
    
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });

    if (!existingUser) {
      logger.info('Creating test user for development');
      const hashedPassword = await hash(testPassword, 10);
      await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Admin User',
          password: hashedPassword,
          role: 'ADMIN',
          status: 'ACTIVE',
          failedLoginAttempts: 0
        }
      });
      logger.info('Test user created successfully');
    } else {
      // Update the existing test user's password to ensure it's correct
      logger.info('Updating test user password');
      const hashedPassword = await hash(testPassword, 10);
      await prisma.user.update({
        where: { email: testEmail },
        data: {
          password: hashedPassword,
          failedLoginAttempts: 0,
          status: 'ACTIVE'
        }
      });
      logger.info('Test user password updated successfully');
    }
  } catch (error) {
    logger.error('Error ensuring test user exists:', { error });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Get client IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 
             request.ip || 
             'unknown';
  
  // Apply rate limiting
  const rateLimiter = new RateLimiter();
  const rateLimitKey = `login:${ip}`;
  const rateLimitResult = await rateLimiter.checkLimit(rateLimitKey, LOGIN_RATE_LIMIT);
  
  // If rate limit exceeded, return 429 Too Many Requests
  if (!rateLimitResult.success) {
    logger.warn('Rate limit exceeded for login', { 
      ip: ip.toString(),
      limit: rateLimitResult.limit,
      reset: new Date(rateLimitResult.reset).toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Too many login attempts', 
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
  
  // In development, ensure a test user exists
  if (process.env.NODE_ENV === 'development') {
    await ensureTestUserExists();
  }
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // Get client info for security logging
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Attempt login
    const result = await AuthService.login({
      email: validatedData.email,
      password: validatedData.password,
      ip: ip.toString(),
      userAgent
    });
    
    // Reset failed attempts on successful login
    await rateLimiter.resetAttempts(ip.toString(), 'login');
    
    // Log success with minimal info
    logger.info('Login successful', { 
      userId: result.user.id,
      ip: ip.toString()
    });
    
    // Return success response with token and user info
    return NextResponse.json({
      success: true,
      data: {
        token: result.token,
        refreshToken: result.refreshToken,
        sessionId: result.sessionId,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        }
      }
    });
  } catch (error) {
    // Record failed attempt for additional tracking
    await rateLimiter.recordFailedAttempt(ip.toString(), 'login');
    
    logger.error('Login failed', { 
      error,
      ip: ip.toString()
    });
    return ErrorHandler.handleApiError(error);
  }
}
