import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { RateLimiter } from '@/lib/rate-limit/RateLimiter';
import { RateLimitError, AppError } from '@/lib/errors';
import { UserRole } from '@/types/rbac';
import logger from '@/lib/logger';
import type { JWT } from 'next-auth/jwt';

// Cache for route configs
const routeConfigCache = new Map<string, APIConfig>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Update AuthToken interface to properly extend JWT
interface AuthToken extends Omit<JWT, 'role'> {
  sub: string;
  role: UserRole; // Make role required and of type UserRole
  emailVerified: boolean | null;
  twoFactorAuthenticated: boolean | null;
}

interface APIConfig {
  requireAuth?: boolean;
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
  rateLimit?: {
    points: number;
    duration: number;
  };
}

interface APIRouteConfig {
  [pattern: string]: APIConfig;
}

// API route configuration
const API_ROUTES: APIRouteConfig = {
  '/api/auth/(.*)': {
    requireAuth: false,
    rateLimit: { points: 50, duration: 60 }, // 50 requests per minute
  },

  '/api/projects/(.*)': {
    requireAuth: true,
    roles: [UserRole.TESTER, UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    requireVerified: true,
    rateLimit: { points: 100, duration: 60 }, // 100 requests per minute
  },

  '/api/test-cases/(.*)': {
    requireAuth: true,
    roles: [UserRole.TESTER, UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    requireVerified: true,
    rateLimit: { points: 100, duration: 60 },
  },

  '/api/admin/(.*)': {
    requireAuth: true,
    roles: [UserRole.ADMIN],
    requireVerified: true,
    require2FA: true,
    rateLimit: { points: 50, duration: 60 },
  },
};

/**
 * Gets route config with caching
 */
function getRouteConfig(pathname: string): APIConfig | undefined {
  // Check cache first
  const cacheKey = pathname;
  const cached = routeConfigCache.get(cacheKey);
  if (cached) return cached;

  // Find matching route config
  const config = Object.entries(API_ROUTES).find(([pattern]) => 
    new RegExp(`^${pattern}$`).test(pathname)
  )?.[1];

  if (config) {
    routeConfigCache.set(cacheKey, config);
    setTimeout(() => routeConfigCache.delete(cacheKey), CACHE_TTL);
  }

  return config;
}

/**
 * Validates user role
 */
function isValidUserRole(role: string | undefined): role is UserRole {
  if (!role) return false;
  return Object.values(UserRole).includes(role as UserRole);
}

/**
 * API protection middleware
 */
export async function apiProtection(request: Request): Promise<Response | undefined> {
  try {
    const { pathname } = new URL(request.url);
    const routeConfig = getRouteConfig(pathname);

    if (!routeConfig) {
      return undefined; // No protection needed
    }

    // Check authentication
    if (routeConfig.requireAuth) {
      const token = await getToken({ req: request as any }) as AuthToken | null;
      if (!token?.sub) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Validate role
      if (routeConfig.roles && (!isValidUserRole(token.role) || 
          !routeConfig.roles.includes(token.role))) {
        logger.warn('Invalid role access attempt', {
          userId: token.sub,
          role: token.role,
          path: pathname,
        });
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Check email verification
      if (routeConfig.requireVerified && !token.emailVerified) {
        return NextResponse.json(
          { error: 'Email verification required' },
          { status: 403 }
        );
      }

      // Check 2FA
      if (routeConfig.require2FA && !token.twoFactorAuthenticated) {
        return NextResponse.json(
          { error: '2FA verification required' },
          { status: 403 }
        );
      }
    }

    // Apply rate limiting
    if (routeConfig.rateLimit) {
      const rateLimiter = new RateLimiter();
      const ip = request.headers.get('x-forwarded-for') || 'unknown';

      try {
        await rateLimiter.checkLimit(ip, routeConfig.rateLimit);
      } catch (error) {
        if (error instanceof RateLimitError) {
          return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { 
              status: 429,
              headers: {
                'Retry-After': String(Math.ceil(error.resetIn / 1000))
              }
            }
          );
        }
        throw error;
      }
    }

    return undefined; // Continue to next middleware/handler
  } catch (error) {
    logger.error('API protection error:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 