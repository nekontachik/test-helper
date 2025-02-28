import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SecurityService } from '@/lib/auth/securityService';
import { RateLimitError } from '@/lib/errors';

export async function authRateLimitMiddleware(
  request: NextRequest,
  type: 'login' | 'password' = 'login'
): Promise<Response | null> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'anonymous';
  
  try {
    await SecurityService.checkBruteForce(ip, type);
    // Return null instead of NextResponse.next() to indicate success
    return null;
  } catch (error) {
    if (error instanceof RateLimitError) {
      return new NextResponse(
        JSON.stringify({
          error: error.message,
          retryAfter: error.resetIn,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': error.resetIn.toString(),
          },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ error: 'Internal Server Error' }),
      { status: 500 }
    );
  }
} 