import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_ROLES } from '@/lib/constants/auth';
import { hasPermission } from './permissions';
import logger from '@/lib/logger';

export async function authMiddleware(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const path = request.nextUrl.pathname;
    
    // Skip authentication for public paths
    if (path.startsWith('/_next') || path.startsWith('/api/auth')) {
      return NextResponse.next();
    }

    if (!token) {
      logger.info('Unauthorized access attempt', { path });
      return NextResponse.redirect(new URL('/api/auth/signin', request.url));
    }

    const userRole = (token.role as keyof typeof USER_ROLES) || USER_ROLES.USER;

    if (!hasPermission(path, userRole)) {
      logger.warn('Permission denied', { path, userRole });
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('Authentication middleware error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      path: request.nextUrl.pathname 
    });
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 