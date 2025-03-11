import { logger } from '@/lib/logger';
import { securityLogger } from '@/lib/utils/securityLogger';
import { ROLE_CONFIG } from '@/constants/auth';
import type { UserRole } from '@/types/auth/roles';
import { hasRequiredRole } from '@/lib/auth/roles';
import { createErrorResponse, ErrorType } from '@/lib/utils/errorResponse';
import type { RBACOptions, SecurityContext, UserContext } from './types';
import { isAuthError } from './guards';
import { checkAuthentication } from './auth';

/**
 * Role-Based Access Control middleware
 * Wraps a request handler with role-based authorization checks
 * 
 * @param handler - The request handler to wrap
 * @param options - RBAC configuration options
 * @returns A middleware function that performs authorization checks
 */
export function withRBAC(
  handler: (request: Request) => Promise<Response>, 
  options: RBACOptions
) {
  return async function rbacMiddleware(request: Request): Promise<Response> {
    try {
      const authResult = await checkAuthentication(request);
      
      if (isAuthError(authResult)) {
        return authResult.response;
      }
      
      const token = authResult.token;
      const path = new URL(request.url).pathname;

      // Security context for logging
      const securityContext: SecurityContext = {
        path,
        ip: authResult.ip || 'unknown',
        userAgent: authResult.userAgent || 'unknown'
      };

      // Add user info to security context
      const userContext: UserContext = {
        ...securityContext,
        userId: token.sub,
        email: token.email,
        role: token.role
      };

      // Role-based checks
      if (options.roles && options.roles.length > 0) {
        // Check if role is valid
        if (!token.role) {
          securityLogger.warn('Missing role in token', userContext);
          
          return createErrorResponse({
            status: 403,
            type: ErrorType.AUTHORIZATION,
            message: 'Invalid user role'
          });
        }

        // Use the centralized role hierarchy check
        const hasPermission = options.roles.some(role => 
          hasRequiredRole(token.role, role)
        );
        
        if (!hasPermission) {
          securityLogger.warn('Insufficient permissions', {
            ...userContext,
            requiredRoles: options.roles
          });
          
          return createErrorResponse({
            status: 403,
            type: ErrorType.AUTHORIZATION,
            message: 'Insufficient permissions'
          });
        }
      }
      
      // Email verification check
      if (options.requireVerified && !token.emailVerified) {
        securityLogger.warn('Unverified email access attempt', userContext);
        
        return createErrorResponse({
          status: 403,
          type: ErrorType.AUTHORIZATION,
          message: 'Email verification required'
        });
      }
      
      // 2FA check
      if (options.require2FA && !token.twoFactorAuthenticated) {
        securityLogger.warn('2FA required access attempt', userContext);
        
        return createErrorResponse({
          status: 403,
          type: ErrorType.AUTHORIZATION,
          message: 'Two-factor authentication required'
        });
      }

      // Permission-based checks (more granular than role-based)
      if (options.permissions && options.permissions.length > 0) {
        const hasAllPermissions = options.permissions.every(permission => {
          // Check if user's role has this permission using the constants
          const rolePermissions = ROLE_CONFIG.PERMISSIONS[token.role] || [];
          return rolePermissions.includes(permission) || rolePermissions.includes('*');
        });

        if (!hasAllPermissions) {
          securityLogger.warn('Missing required permissions', {
            ...userContext,
            requiredPermissions: options.permissions
          });
          
          return createErrorResponse({
            status: 403,
            type: ErrorType.AUTHORIZATION,
            message: 'Missing required permissions'
          });
        }
      }

      // All checks passed, proceed to handler
      return handler(request);
    } catch (error) {
      // Log the error with detailed information
      logger.error('RBAC middleware error:', {
        error: error instanceof Error ? error.message : String(error),
        errorType: error instanceof Error ? error.constructor.name : typeof error,
        stack: error instanceof Error ? error.stack : undefined,
        path: new URL(request.url).pathname,
      });
      
      // More specific error response
      if (error instanceof Error && error.name === 'TokenExpiredError') {
        return createErrorResponse({
          status: 401,
          type: ErrorType.AUTHENTICATION,
          message: 'Authentication token expired'
        });
      }
      
      return createErrorResponse({
        status: 500,
        type: ErrorType.SERVER_ERROR,
        message: 'Internal server error'
      });
    }
  };
}

/**
 * Helper function to create RBAC middleware with common options
 * @param roles - Array of roles that can access the route
 * @param options - Additional RBAC options
 */
export function createRBACMiddleware(
  roles?: UserRole[],
  options: Omit<RBACOptions, 'roles'> = {}
): (handler: (request: Request) => Promise<Response>) => (request: Request) => Promise<Response> {
  // Use a type assertion to fix the type error
  const rbacOptions: RBACOptions = { ...options, roles };
  return (handler: (request: Request) => Promise<Response>) => 
    withRBAC(handler, rbacOptions);
} 