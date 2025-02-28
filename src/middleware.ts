import { type NextRequest, NextResponse } from 'next/server';
import { verify, type JwtPayload } from 'jsonwebtoken';
import logger from '@/lib/utils/logger';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/auth/register',
  '/auth/reset-password',
  '/auth/verify',
  '/api/auth/signin',
  '/api/debug',
];

// Define the token payload interface
interface TokenPayload extends JwtPayload {
  id: string;
  email: string;
  role?: string;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  try {
    const path = request.nextUrl.pathname;
    
    // Skip authentication for public paths
    if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
      return NextResponse.next();
    }
    
    // Skip authentication for API routes that handle their own auth
    if (path.startsWith('/api/auth/')) {
      return NextResponse.next();
    }
    
    // Get the token from the cookie
    const token = request.cookies.get('session-token')?.value;
    
    if (!token) {
      logger.warn('No session token found', { path });
      
      // Redirect to sign-in page
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(signInUrl);
    }
    
    try {
      // Verify the token
      const decoded = verify(
        token, 
        process.env.NEXTAUTH_SECRET || 'a-very-secure-secret-for-development-only'
      ) as TokenPayload;
      
      // Log the decoded token for debugging
      logger.debug('Token verified successfully', { 
        userId: decoded.id,
        path
      });
      
      // Token is valid, allow the request
      return NextResponse.next();
    } catch (error) {
      logger.error('Invalid session token', { 
        error: error instanceof Error ? error.message : String(error),
        path
      });
      
      // Token is invalid, redirect to sign-in page
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', path);
      return NextResponse.redirect(signInUrl);
    }
  } catch (error) {
    logger.error('Error in middleware', { 
      error: error instanceof Error ? error.message : String(error),
      path: request.nextUrl.pathname
    });
    
    // In case of error, allow the request to proceed
    // The application can handle authentication errors at the component level
    return NextResponse.next();
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all paths except static files, api routes, and _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
