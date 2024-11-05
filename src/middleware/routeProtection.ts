import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole, UserRoles } from '@/types/rbac';
import type { JWT } from 'next-auth/jwt';

interface RouteConfig {
  requireAuth?: boolean;
  roles?: Array<keyof typeof UserRoles>;
  requireVerified?: boolean;
  require2FA?: boolean;
}

interface AuthToken extends JWT {
  sub?: string;
  role: string;
  emailVerified?: boolean;
  twoFactorAuthenticated?: boolean;
}

// Define route patterns and their configurations
const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  // Public routes
  '/auth/(.*)': { requireAuth: false },
  '/api/auth/(.*)': { requireAuth: false },

  // Protected routes
  '/dashboard': { requireAuth: true, requireVerified: true },
  '/profile': { requireAuth: true },
  
  // Role-specific routes
  '/projects/(.*)': { 
    requireAuth: true, 
    roles: ['TESTER', 'PROJECT_MANAGER', 'ADMIN'],
    requireVerified: true 
  },
  '/test-cases/(.*)': { 
    requireAuth: true, 
    roles: ['TESTER', 'PROJECT_MANAGER', 'ADMIN'],
    requireVerified: true 
  },
  '/reports/(.*)': { 
    requireAuth: true, 
    roles: ['PROJECT_MANAGER', 'ADMIN'],
    requireVerified: true 
  },
  '/admin/(.*)': { 
    requireAuth: true, 
    roles: ['ADMIN'],
    requireVerified: true,
    require2FA: true 
  },
};

/**
 * Validates if a string is a valid UserRole
 * @param role - Role to validate
 * @returns boolean indicating if role is valid
 */
function isValidUserRole(role: string): role is UserRole {
  return Object.values(UserRoles).includes(role as UserRole);
}

/**
 * Middleware to protect routes with authentication and authorization
 * @param request - Incoming request
 * @returns Response object
 */
export async function routeProtection(request: Request): Promise<Response> {
  try {
    const { pathname } = new URL(request.url);

    // Find matching route configuration
    const config = Object.entries(ROUTE_CONFIGS).find(([pattern]) => 
      new RegExp(`^${pattern}$`).test(pathname)
    )?.[1] ?? { requireAuth: true }; // Default to requiring auth

    // Allow public routes
    if (!config.requireAuth) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request as any }) as AuthToken | null;

    // Handle unauthenticated users
    if (!token?.sub) {
      const signInUrl = new URL('/auth/signin', request.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Validate user role
    if (!token.role || !isValidUserRole(token.role)) {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 403 }
      );
    }

    const userRole = token.role as UserRole;

    // Check email verification
    if (config.requireVerified && !token.emailVerified) {
      return NextResponse.redirect(new URL('/auth/verify', request.url));
    }

    // Check 2FA requirement
    if (config.require2FA && !token.twoFactorAuthenticated) {
      return NextResponse.redirect(new URL('/auth/2fa/verify', request.url));
    }

    // Check role-based access
    if (config.roles) {
      const validRole = isValidUserRole(token.role) ? token.role : null;
      if (!validRole || !config.roles.includes(validRole)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Route protection error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 