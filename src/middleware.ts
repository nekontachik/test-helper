import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimiter } from './lib/middleware/rateLimit';

// Set to true to bypass authentication in development
const DEV_MODE = true;

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // In development mode, bypass authentication
  if (DEV_MODE) {
    return NextResponse.next();
  }

  // Get the token if it exists
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Apply rate limiting
  const rateLimitResponse = await rateLimiter(request, isAuthenticated);
  if (rateLimitResponse) return rateLimitResponse;

  // Continue with the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
