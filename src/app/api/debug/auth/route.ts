import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import logger from '@/lib/utils/logger';

export async function GET(): Promise<NextResponse> {
  try {
    logger.info('Debug auth endpoint called');
    
    // Get a safe version of auth options for debugging
    const safeAuthOptions = {
      providers: authOptions.providers.map(provider => ({
        id: provider.id,
        name: provider.name,
        type: provider.type
      })),
      callbacks: Object.keys(authOptions.callbacks || {}),
      pages: authOptions.pages,
      session: authOptions.session,
      debug: authOptions.debug,
      secret: authOptions.secret ? 'REDACTED' : undefined,
    };
    
    // Check environment variables
    const envVars = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'REDACTED' : undefined,
      NODE_ENV: process.env.NODE_ENV,
      LOG_LEVEL: process.env.LOG_LEVEL,
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Auth debug information',
      authOptions: safeAuthOptions,
      environment: envVars,
    });
  } catch (error) {
    logger.error('Error in auth debug endpoint', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 