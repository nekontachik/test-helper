import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';
import { RBACService } from '@/lib/auth/rbac/service';
import { OwnershipService } from '@/lib/auth/ownership/service';
import { Action, Resource, UserRole } from '@/types/rbac';
import { AuthorizationError } from '@/lib/errors';
import logger from '@/lib/logger';

interface AuthorizeOptions {
  action: Action;
  resource: Resource;
  checkOwnership?: boolean;
  allowTeamMembers?: boolean;
  getResourceId?: (req: Request) => Promise<string | undefined>;
  getProjectId?: (req: Request) => Promise<string | undefined>;
  customCheck?: (userId: string, resourceId: string) => Promise<boolean>;
}

interface AuthToken {
  sub?: string;
  role: UserRole;
}

// Cache permission results with proper typing
const permissionCache = new Map<string, boolean>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(role: UserRole, action: Action, resource: Resource): string {
  return `${role}:${action}:${resource}`;
}

export async function authorize(
  request: Request,
  options: AuthorizeOptions
): Promise<Response> {
  try {
    const token = await getToken({ req: request as any }) as AuthToken | null;
    if (!token?.sub) {
      throw new AuthorizationError('No authentication token');
    }

    // Check permission cache first
    const cacheKey = getCacheKey(token.role, options.action, options.resource);
    const cachedPermission = permissionCache.get(cacheKey);
    
    if (cachedPermission !== undefined) {
      if (!cachedPermission) {
        throw new AuthorizationError('Insufficient permissions');
      }
    } else {
      // Check RBAC permissions and cache result
      const hasPermission = await RBACService.checkPermission(
        token.sub,
        token.role,
        {
          action: options.action,
          resource: options.resource
        }
      );

      permissionCache.set(cacheKey, hasPermission);
      setTimeout(() => permissionCache.delete(cacheKey), CACHE_TTL);

      if (!hasPermission) {
        throw new AuthorizationError('Insufficient permissions');
      }
    }

    // If ownership check is required
    if (options.checkOwnership) {
      const resourceId = options.getResourceId 
        ? await options.getResourceId(request)
        : request.url.split('/').pop();

      if (!resourceId) {
        throw new AuthorizationError('Resource ID not found');
      }

      let isAuthorized = false;

      // Check resource ownership with Promise.race for performance
      switch (options.resource) {
        case Resource.PROJECT:
          isAuthorized = await Promise.race([
            OwnershipService.isProjectOwner(token.sub, resourceId),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Ownership check timeout')), 5000)
            )
          ]);
          break;
        case Resource.TEST_CASE:
          isAuthorized = await Promise.race([
            OwnershipService.isTestCaseOwner(token.sub, resourceId),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Ownership check timeout')), 5000)
            )
          ]);
          break;
        case Resource.TEST_RUN:
          isAuthorized = await Promise.race([
            OwnershipService.isTestRunOwner(token.sub, resourceId),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Ownership check timeout')), 5000)
            )
          ]);
          break;
        default:
          if (options.customCheck) {
            isAuthorized = await Promise.race([
              options.customCheck(token.sub, resourceId),
              new Promise<boolean>((_, reject) => 
                setTimeout(() => reject(new Error('Custom check timeout')), 5000)
              )
            ]);
          }
      }

      if (!isAuthorized && options.allowTeamMembers && options.getProjectId) {
        const projectId = await options.getProjectId(request);
        if (projectId) {
          isAuthorized = await Promise.race([
            OwnershipService.isTeamMember(token.sub, projectId),
            new Promise<boolean>((_, reject) => 
              setTimeout(() => reject(new Error('Team membership check timeout')), 5000)
            )
          ]);
        }
      }

      if (!isAuthorized) {
        throw new AuthorizationError('Resource access denied');
      }
    }

    return NextResponse.next();
  } catch (error) {
    logger.error('Authorization error:', error);

    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Authorization failed' },
      { status: 403 }
    );
  }
}

export const withAuthorization = (
  handler: (request: Request) => Promise<Response>,
  options: AuthorizeOptions
): ((request: Request) => Promise<Response>) => {
  return async function(request: Request): Promise<Response> {
    try {
      const authzResponse = await authorize(request, options);
      if (authzResponse.status === 403) {
        return authzResponse;
      }
      return handler(request);
    } catch (error) {
      logger.error('Authorization error:', error);
      return NextResponse.json(
        { error: 'Authorization failed' },
        { status: 403 }
      );
    }
  };
}; 