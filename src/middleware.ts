import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { rateLimiter } from './lib/middleware/rateLimit';

const PUBLIC_PATHS = ['/login', '/register', '/api/auth'];

export async function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

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
