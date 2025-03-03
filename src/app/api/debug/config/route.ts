import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET(): Promise<NextResponse> {
  try {
    logger.info('Debug config endpoint called');
    
    // Get environment variables
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const nodeEnv = process.env.NODE_ENV;
    
    // Check if NEXTAUTH_URL is valid
    let nextAuthUrlValid = false;
    let nextAuthUrlError = null;
    
    if (nextAuthUrl) {
      try {
        new URL(nextAuthUrl);
        nextAuthUrlValid = true;
      } catch (error) {
        nextAuthUrlError = error instanceof Error ? error.message : String(error);
      }
    }
    
    // Get request info
    const requestInfo = {
      headers: {
        host: process.env.VERCEL_URL || 'localhost:3000',
      }
    };
    
    return NextResponse.json({
      status: 'success',
      message: 'Configuration debug information',
      environment: {
        NEXTAUTH_URL: nextAuthUrl,
        NODE_ENV: nodeEnv,
      },
      validation: {
        nextAuthUrlValid,
        nextAuthUrlError,
      },
      requestInfo,
    });
  } catch (error) {
    logger.error('Error in config debug endpoint', error);
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