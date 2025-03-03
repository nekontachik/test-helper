import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROUTES } from '@/config/routes';
import { isValidUserRole, hasRequiredRole } from '@/lib/auth/roles';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { SecurityService } from '@/lib/security/securityService';
import { AuditService } from '@/lib/audit/auditService';
import { logger } from '@/lib/logger';
import type { UserRole } from '@/types/auth';

// Token interface with proper typing
interface AuthToken {
  sub: string;
  email: string;
  role?: string;
  emailVerified?: boolean;
  twoFactorAuthenticated?: boolean;
  exp?: number;
  iat?: number;
  jti?: string;
}

/**
 * Get route configuration for a given path
 * @param pathname - URL path to check
 * @returns Route configuration or undefined
 */
function getRouteConfig(pathname: string) {
  // Check public routes first
  for (const [pattern, config] of Object.entries(ROUTES.public)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      return { ...config, isPublic: true };
    }
  }
  
  // Check API routes
  if (pathname.startsWith('/api/')) {
    for (const [pattern, config] of Object.entries(ROUTES.api)) {
      if (new RegExp(`^${pattern}$`).test(pathname)) {
        return { ...config, isApi: true };
      }
    }
  }
  
  // Check web routes
  for (const [pattern, config] of Object.entries(ROUTES.web)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      return { ...config, isWeb: true };
    }
  }
  
  // Default to requiring authentication
  return { requireAuth: true, isWeb: true };
}

/**
 * Check if a path is for a static file
 * @param pathname - Path to check
 * @returns boolean indicating if path is for a static file
 */
function isStaticFile(pathname: string): boolean {
  return Boolean(pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/));
}

/**
 * Unified auth middleware
 * @param request - Incoming request
 * @returns Response object
 */
export async function authMiddleware(request: NextRequest): Promise<NextResponse> {
  try {
    const { pathname } = new URL(request.url);
    
    // Skip middleware for static files
    if (isStaticFile(pathname)) {
      return NextResponse.next();
    }
    
    // Get route configuration
    const routeConfig = getRouteConfig(pathname);
    
    // Initialize response with security headers
    const response = NextResponse.next();
    const headers = SecurityService.getSecurityHeaders();
    Object.entries(headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Allow public routes
    if (!routeConfig.requireAuth) {
      return response;
    }
    
    // Get and validate token
    const token = await getToken({ req: request }) as AuthToken | null;
    
    // Handle unauthenticated users
    if (!token?.sub) {
      // For API routes, return 401
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // For web routes, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
      return NextResponse.redirect(loginUrl);
    }
    
    // Validate user role
    if (token.role && !isValidUserRole(token.role)) {
      logger.warn('Invalid user role', { userId: token.sub, role: token.role });
      
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Invalid user role' },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    // Check role-based access
    if (routeConfig.roles && token.role) {
      const hasRole = hasRequiredRole(token.role as UserRole, routeConfig.roles);
      
      if (!hasRole) {
        logger.warn('Insufficient permissions', {
          userId: token.sub,
          role: token.role,
          requiredRoles: routeConfig.roles,
          path: pathname
        });
        
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
        
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }
    
    // Check email verification
    if (routeConfig.requireVerified && !token.emailVerified) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Email verification required' },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/auth/verify', request.url));
    }
    
    // Check 2FA
    if (routeConfig.require2FA && !token.twoFactorAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '2FA verification required' },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/auth/2fa/verify', request.url));
    }
    
    // Apply rate limiting for API routes
    if (pathname.startsWith('/api/') && routeConfig.rateLimit) {
      const rateLimiter = new RateLimiter();
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      
      try {
        await rateLimiter.checkLimit(ip, routeConfig.rateLimit);
      } catch (error) {
        logger.warn('Rate limit exceeded', { ip, path: pathname });
        
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: { 'Retry-After': '60' }
          }
        );
      }
    }
    
    // Log request for auditing if needed
    if (pathname.startsWith('/api/') && routeConfig.auditActions) {
      await AuditService.log({
        userId: token.sub,
        type: 'SYSTEM',
        action: 'API_REQUEST',
        metadata: {
          path: pathname,
          method: request.method,
          ip: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
        },
        status: 'SUCCESS'
      });
    }
    
    return response;
  } catch (error) {
    logger.error('Auth middleware error:', error);
    
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    return NextResponse.redirect(new URL('/error', request.url));
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