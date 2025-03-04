import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';
import { isStaticFile, getRouteConfig } from './routeConfig';
import { extractToken, verifyToken } from './tokenUtils';
import { tokenHasRequiredRole, tokenMeetsVerificationRequirement, tokenMeetsTwoFactorRequirement } from './roleCheck';
import { rateLimiter } from './rateLimit';
import {
  handleApiUnauthorized,
  handleWebUnauthorized,
  handleApiInsufficientPermissions,
  handleWebInsufficientPermissions,
  handleApiVerificationRequired,
  handleWebVerificationRequired,
  handleApiTwoFactorRequired,
  handleWebTwoFactorRequired,
  handleApiRateLimitExceeded,
  handleApiError,
  handleWebError
} from './responseHandler';
import type { AuthToken } from './types';

// Re-export types for external use
export * from './types';

// Extend NextApiRequest to include user property
interface AuthenticatedRequest extends NextApiRequest {
  user?: AuthToken;
}

/**
 * Authentication middleware for Next.js API routes and pages
 * @param req - Next.js request object
 * @param res - Next.js response object
 * @param next - Next function to call if authentication passes
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => Promise<void>
): Promise<void> {
  try {
    const { url } = req;
    const pathname = url?.split('?')[0] || '/';
    
    // Skip auth for static files
    if (isStaticFile(pathname)) {
      return next();
    }
    
    // Get route configuration
    const routeConfig = getRouteConfig(pathname);
    
    // Skip auth for public routes
    if (!routeConfig.requireAuth) {
      return next();
    }
    
    // Extract token from request
    const token = extractToken({
      headers: { authorization: req.headers.authorization || undefined },
      cookies: req.cookies
    });
    
    // Check if token exists
    if (!token) {
      if ('isApi' in routeConfig && routeConfig.isApi) {
        return handleApiUnauthorized(res);
      } else if ('isWeb' in routeConfig) {
        return handleWebUnauthorized(res, routeConfig);
      }
      // Default fallback if neither API nor web route
      return handleApiUnauthorized(res);
    }
    
    // Verify token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      if ('isApi' in routeConfig && routeConfig.isApi) {
        return handleApiUnauthorized(res, 'Invalid token');
      } else if ('isWeb' in routeConfig) {
        return handleWebUnauthorized(res, routeConfig);
      }
      // Default fallback
      return handleApiUnauthorized(res);
    }
    
    // Attach token to request for use in route handlers
    req.user = decodedToken;
    
    // Check rate limits for API routes
    if ('isApi' in routeConfig && routeConfig.isApi && routeConfig.rateLimit) {
      const clientIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '';
      
      if (rateLimiter.isRateLimited(clientIp, routeConfig.rateLimit)) {
        return handleApiRateLimitExceeded(res);
      }
    }
    
    // Check role permissions
    if ('roles' in routeConfig && !tokenHasRequiredRole(decodedToken, routeConfig.roles)) {
      if ('isApi' in routeConfig && routeConfig.isApi) {
        return handleApiInsufficientPermissions(res);
      } else if ('isWeb' in routeConfig) {
        return handleWebInsufficientPermissions(res);
      }
    }
    
    // Check email verification if required
    if ('requireVerified' in routeConfig && 
        routeConfig.requireVerified && 
        !tokenMeetsVerificationRequirement(decodedToken, routeConfig.requireVerified)) {
      if ('isApi' in routeConfig && routeConfig.isApi) {
        return handleApiVerificationRequired(res);
      } else if ('isWeb' in routeConfig) {
        return handleWebVerificationRequired(res);
      }
    }
    
    // Check 2FA if required
    if ('requireTwoFactor' in routeConfig && 
        routeConfig.requireTwoFactor && 
        !tokenMeetsTwoFactorRequirement(decodedToken, routeConfig.requireTwoFactor)) {
      if ('isApi' in routeConfig && routeConfig.isApi) {
        return handleApiTwoFactorRequired(res);
      } else if ('isWeb' in routeConfig) {
        return handleWebTwoFactorRequired(res);
      }
    }
    
    // Log API requests for auditing
    if ('isApi' in routeConfig && routeConfig.isApi) {
      logApiRequest(decodedToken, req);
    }
    
    // All checks passed, proceed to route handler
    return next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    
    if (req.url?.startsWith('/api/')) {
      return handleApiError(res, error as Error);
    } else {
      return handleWebError(res);
    }
  }
}

/**
 * Log API request for auditing purposes
 * @param token - Decoded auth token
 * @param req - Next.js request object
 */
function logApiRequest(token: AuthToken, req: NextApiRequest): void {
  const { method, url } = req;
  
  logger.info('API request', {
    userId: token.sub,
    method,
    path: url,
    userAgent: req.headers['user-agent'],
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
  });
} 