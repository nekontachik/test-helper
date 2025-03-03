import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { ROUTES } from '@/config/routes';
import { isValidUserRole, hasRequiredRole } from '@/lib/auth/roles';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { SecurityService } from '@/lib/security/securityService';
import { AuditService } from '@/lib/audit/auditService';
import { logger } from '@/lib/utils/clientLogger';
import type { UserRole } from '@/types/auth';
import { AuditLogType } from '@/types/audit';

// Token interface with proper typing
interface AuthToken {
  sub: string;
  email: string;
  role?: UserRole;
  emailVerified?: string | null;
  twoFactorAuthenticated?: boolean;
  exp?: number;
  iat?: number;
  jti?: string;
}

// Define route configuration types
interface BaseRouteConfig {
  requireAuth: boolean;
}

interface PublicRouteConfig extends BaseRouteConfig {
  isPublic: boolean;
}

interface ApiRouteConfig extends BaseRouteConfig {
  isApi: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
  rateLimit?: {
    points: number;
    duration: number;
  };
  auditActions?: boolean;
}

interface WebRouteConfig extends BaseRouteConfig {
  isWeb: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
}

type RouteConfig = PublicRouteConfig | ApiRouteConfig | WebRouteConfig;

// Cache for route pattern matching
const routePatternCache = new Map<string, { pattern: string, config: RouteConfig }>();

/**
 * Check if a token is expired
 * @param token - The authentication token to check
 * @returns boolean indicating if the token is expired
 */
function isTokenExpired(token: AuthToken): boolean {
  if (!token.exp) return false;
  
  // Get current time in seconds (JWT exp is in seconds)
  const currentTime = Math.floor(Date.now() / 1000);
  
  // Token is expired if current time is greater than expiration time
  return currentTime > token.exp;
}

/**
 * Get route configuration for a given path
 * @param pathname - URL path to check
 * @returns Route configuration or undefined
 */
function getRouteConfig(pathname: string): RouteConfig {
  // Check cache first
  if (routePatternCache.has(pathname)) {
    const cached = routePatternCache.get(pathname);
    return cached!.config;
  }
  
  // Check public routes
  for (const [pattern, routeConfig] of Object.entries(ROUTES.public)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      const config = { 
        ...routeConfig,
        requireAuth: false, 
        isPublic: true 
      } as RouteConfig;
      
      // Cache the result
      routePatternCache.set(pathname, { pattern, config });
      return config;
    }
  }
  
  // Check API routes
  if (pathname.startsWith('/api/')) {
    for (const [pattern, routeConfig] of Object.entries(ROUTES.api)) {
      if (new RegExp(`^${pattern}$`).test(pathname)) {
        const config = { 
          ...routeConfig,
          requireAuth: true, 
          isApi: true 
        } as ApiRouteConfig;
        
        // Cache the result
        routePatternCache.set(pathname, { pattern, config });
        return config;
      }
    }
  }
  
  // Check web routes
  for (const [pattern, routeConfig] of Object.entries(ROUTES.web)) {
    if (new RegExp(`^${pattern}$`).test(pathname)) {
      const config = { 
        ...routeConfig,
        requireAuth: true, 
        isWeb: true 
      } as WebRouteConfig;
      
      // Cache the result
      routePatternCache.set(pathname, { pattern, config });
      return config;
    }
  }
  
  // Default to requiring authentication
  const defaultConfig = pathname.startsWith('/api/') 
    ? { requireAuth: true, isApi: true } as ApiRouteConfig
    : { requireAuth: true, isWeb: true } as WebRouteConfig;
  
  routePatternCache.set(pathname, { pattern: '', config: defaultConfig });
  return defaultConfig;
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
      response.headers.set(key, value as string);
    });
    
    // Allow public routes
    if (!routeConfig.requireAuth) {
      return response;
    }
    
    // Get and validate token
    const token = await getToken({ req: request }) as AuthToken | null;
    
    // Handle missing token
    if (!token?.sub) {
      logger.warn('Authentication required but no token found', { 
        path: pathname,
        method: request.method
      });
      
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
    
    // Handle expired token
    if (isTokenExpired(token)) {
      logger.warn('Token expired', { 
        userId: token.sub,
        path: pathname,
        method: request.method,
        expiredAt: new Date(token.exp! * 1000).toISOString()
      });
      
      // For API routes, return 401 with specific message
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Session expired', code: 'token_expired' },
          { status: 401 }
        );
      }
      
      // For web routes, redirect to login with expired session message
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', encodeURIComponent(request.url));
      loginUrl.searchParams.set('error', 'SessionExpired');
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
    
    // Check role-based access for API routes
    if ('isApi' in routeConfig && routeConfig.roles && token.role) {
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
    
    // Check email verification for API routes
    if ('isApi' in routeConfig && routeConfig.requireVerified && (!token.emailVerified || token.emailVerified === null)) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: 'Email verification required' },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/auth/verify', request.url));
    }
    
    // Check 2FA for API routes
    if ('isApi' in routeConfig && routeConfig.require2FA && !token.twoFactorAuthenticated) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { error: '2FA verification required' },
          { status: 403 }
        );
      }
      
      return NextResponse.redirect(new URL('/auth/2fa/verify', request.url));
    }
    
    // Apply rate limiting for API routes
    if ('isApi' in routeConfig && routeConfig.rateLimit) {
      const rateLimiter = new RateLimiter();
      const ip = request.headers.get('x-forwarded-for') || 'unknown';
      
      try {
        await rateLimiter.checkLimit(ip, routeConfig.rateLimit);
      } catch {
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
    
    // Log API request for auditing
    await AuditService.log({
      userId: token.sub,
      type: AuditLogType.SYSTEM,
      action: 'API_REQUEST',
      metadata: {
        path: pathname,
        method: request.method,
      },
      status: 'SUCCESS'
    });
    
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