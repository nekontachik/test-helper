import type { NextApiRequest, NextApiResponse } from 'next';
import { UserRole } from '@/types/auth';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { isRecord, hasProperty } from '@/lib/utils/isValidType';
import { getToken } from 'next-auth/jwt';
import type { JWT } from 'next-auth/jwt';
import logger from '@/lib/utils/logger';

/**
 * Simple interface for authenticated user
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Check if a token is a valid JWT with our required properties
 */
function isValidToken(token: unknown): token is JWT & {
  id: string;
  email: string;
  name: string;
  role: UserRole;
} {
  if (!isRecord(token)) return false;
  
  return typeof token.id === 'string' &&
         typeof token.email === 'string' &&
         typeof token.name === 'string' &&
         // Ensure role is a valid UserRole enum value
         typeof token.role === 'string' && 
         Object.values(UserRole).includes(token.role as UserRole);
}

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(req: NextApiRequest): Promise<boolean> {
  try {
    const token = await getToken({ req });
    return Boolean(token);
  } catch (error) {
    logger.error('Authentication check failed', { error });
    return false;
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    const token = await getToken({ req });
    if (!token) {
      logger.debug('No token found in request');
      return null;
    }
    
    if (!isValidToken(token)) {
      logger.warn('Invalid token structure', { 
        tokenKeys: token ? Object.keys(token) : [] 
      });
      return null;
    }
    
    return {
      id: token.id,
      email: token.email,
      name: token.name,
      role: token.role
    };
  } catch (error) {
    logger.error('Error getting current user', { error });
    return null;
  }
}

/**
 * Check if the current user has the required role
 */
export async function hasRole(req: NextApiRequest, requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser(req);
  if (!user) return false;
  
  // Define role hierarchy using the actual UserRole enum values
  const roleValues: Record<UserRole, number> = {
    [UserRole.VIEWER]: 1,
    [UserRole.USER]: 2,
    [UserRole.TESTER]: 3,
    [UserRole.EDITOR]: 4,
    [UserRole.PROJECT_MANAGER]: 5,
    [UserRole.ADMIN]: 6
  };
  
  // Ensure both roles exist in the mapping
  if (!(user.role in roleValues) || !(requiredRole in roleValues)) {
    logger.warn('Invalid role comparison', { 
      userRole: user.role, 
      requiredRole,
      validRoles: Object.keys(roleValues)
    });
    return false;
  }
  
  const hasRequiredRole = roleValues[user.role] >= roleValues[requiredRole];
  
  if (!hasRequiredRole) {
    logger.info('Permission denied', {
      userId: user.id,
      userRole: user.role,
      requiredRole,
      path: req.url
    });
  }
  
  return hasRequiredRole;
}

/**
 * Middleware to check authentication
 */
export function withAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  requiredRole?: UserRole
) {
  return async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
    try {
      const isUserAuthenticated = await isAuthenticated(req);
      
      if (!isUserAuthenticated) {
        logger.info('Unauthorized access attempt', { 
          path: req.url,
          method: req.method,
          ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        });
        
        res.status(401).json({ 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'You must be logged in to access this resource' 
          } 
        });
        return;
      }
      
      if (requiredRole && !(await hasRole(req, requiredRole))) {
        const user = await getCurrentUser(req);
        
        logger.info('Forbidden access attempt', { 
          userId: user?.id,
          userRole: user?.role,
          requiredRole,
          path: req.url,
          method: req.method
        });
        
        res.status(403).json({ 
          success: false, 
          error: { 
            code: 'FORBIDDEN', 
            message: 'You do not have permission to access this resource' 
          } 
        });
        return;
      }
      
      return handler(req, res);
    } catch (error) {
      logger.error('Authentication error', { 
        error,
        path: req.url,
        method: req.method
      });
      
      res.status(500).json({
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'An error occurred during authentication'
        }
      });
    }
  };
} 