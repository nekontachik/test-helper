import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import logger from '@/lib/logger';
import type { NextRequest } from 'next/server';
import { securityLogger } from '@/lib/utils/securityLogger';
import type { UserRole } from '@/types/auth';
import { hasRequiredRole } from '@/lib/auth/roles';
import { ROLE_PERMISSIONS } from './permissions';
import type { PermissionGuardConfig } from './types';

/**
 * Permission guard middleware
 * Checks if the user has the required permissions to access a route
 */
export async function permissionGuard(
  request: Request,
  config: PermissionGuardConfig
): Promise<Response | undefined> {
  try {
    // Get the token from the request
    const token = await getToken({ req: request as unknown as NextRequest });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if token has required fields
    if (!token.sub || !token.email) {
      securityLogger.warn('Invalid token format', {
        path: new URL(request.url).pathname,
        tokenFields: Object.keys(token)
      });
      
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Role-based checks
    if (config.roles && config.roles.length > 0) {
      if (!token.role) {
        securityLogger.warn('Missing role in token', {
          userId: token.sub,
          path: new URL(request.url).pathname
        });
        
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
      
      const hasPermission = config.roles.some(role => 
        hasRequiredRole(token.role as UserRole, role)
      );
      
      if (!hasPermission) {
        securityLogger.warn('Insufficient role permissions', {
          userId: token.sub,
          userRole: token.role,
          requiredRoles: config.roles,
          path: new URL(request.url).pathname
        });
        
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }
    
    // Email verification check
    if (config.requireVerified && !token.emailVerified) {
      return NextResponse.json(
        { error: 'Email verification required' },
        { status: 403 }
      );
    }
    
    // 2FA check
    if (config.require2FA && !token.twoFactorAuthenticated) {
      return NextResponse.json(
        { error: 'Two-factor authentication required' },
        { status: 403 }
      );
    }
    
    // Permission-based checks
    if (config.permissions && config.permissions.length > 0) {
      for (const permission of config.permissions) {
        const permissionKey = `${permission.action}:${permission.resource}`;
        
        // Get permissions for the user's role
        const userRole = token.role as UserRole;
        const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
        
        // Check if the role has the required permission
        const hasPermission = rolePermissions.includes(permissionKey) || rolePermissions.includes('*');
        
        // If ownership check is required, we'll need to do that in the handler
        if (!hasPermission && !config.checkOwnership) {
          securityLogger.warn('Missing specific permission', {
            userId: token.sub,
            userRole: token.role,
            requiredPermission: permissionKey,
            path: new URL(request.url).pathname
          });
          
          return NextResponse.json(
            { error: 'Insufficient permissions' },
            { status: 403 }
          );
        }
      }
    }
    
    // All checks passed
    return undefined;
  } catch (error) {
    logger.error('Permission guard error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 