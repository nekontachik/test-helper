import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import logger from '@/lib/utils/logger';

export async function POST(_request: NextRequest): Promise<NextResponse> {
  try {
    logger.debug('Sign-out requested');
    
    // Clear the session token cookie
    cookies().delete('session-token');
    
    logger.debug('Session token cleared');
    
    return NextResponse.json(
      { success: true, message: 'Signed out successfully' }, 
      { status: 200 }
    );
  } catch (error) {
    logger.error('Error during sign-out', { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 