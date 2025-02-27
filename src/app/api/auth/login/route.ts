import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthService } from '@/lib/auth/authService';
import { ErrorHandler } from '@/lib/errors/errorHandler';
import logger from '@/lib/logger';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

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
  // In development, ensure a test user exists
  if (process.env.NODE_ENV === 'development') {
    await ensureTestUserExists();
  }
  
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = loginSchema.parse(body);
    
    // Get client info for security logging
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Attempt login
    const result = await AuthService.login({
      email: validatedData.email,
      password: validatedData.password,
      ip: ip.toString(),
      userAgent
    });
    
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
    logger.error('Login failed', { error });
    return ErrorHandler.handleApiError(error);
  }
}
