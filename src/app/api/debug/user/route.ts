import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
  try {
    logger.info('Debug API: Checking test user');
    
    const testEmail = 'test@example.com';
    
    // Check if test user exists
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        status: true,
        // Don't include password in response
      }
    });
    
    if (!user) {
      logger.warn('Debug API: Test user not found');
      return NextResponse.json({ exists: false, message: 'Test user not found' });
    }
    
    logger.info('Debug API: Test user found', { userId: user.id, status: user.status });
    
    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        status: user.status
      }
    });
  } catch (error) {
    logger.error('Debug API error:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Failed to check test user' },
      { status: 500 }
    );
  }
} 