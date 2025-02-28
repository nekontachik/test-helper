import { NextResponse } from 'next/server';
import logger from '@/lib/utils/logger';

export async function GET(): Promise<NextResponse> {
  try {
    logger.info('Debug NextAuth client endpoint called');
    
    // Get environment variables
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Create test URLs to check URL construction
    const testUrls = [
      { name: 'Root URL', url: baseUrl },
      { name: 'Dashboard URL', url: `${baseUrl}/dashboard` },
      { name: 'Relative URL', url: '/dashboard' },
      { name: 'Empty URL', url: '' },
      { name: 'Null URL', url: null },
      { name: 'Undefined URL', url: undefined }
    ];
    
    // Test URL construction
    const urlTests = testUrls.map(test => {
      try {
        // Only try to construct URL if the test URL is not null or undefined
        const constructedUrl = test.url ? new URL(test.url, baseUrl) : null;
        return {
          name: test.name,
          input: test.url,
          valid: true,
          constructed: constructedUrl ? constructedUrl.toString() : null,
          error: null
        };
      } catch (error) {
        return {
          name: test.name,
          input: test.url,
          valid: false,
          constructed: null,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'NextAuth client debug information',
      environment: {
        NEXTAUTH_URL: nextAuthUrl,
        baseUrl
      },
      urlTests
    });
  } catch (error) {
    logger.error('Error in NextAuth client debug endpoint', error);
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