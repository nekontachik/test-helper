import type { NextApiResponse } from 'next';
import type { WebRouteConfig } from './types';

/**
 * Handle unauthorized access for API routes
 * @param res - Next.js API response object
 * @param message - Error message to return
 * @param statusCode - HTTP status code to return
 */
export function handleApiUnauthorized(
  res: NextApiResponse,
  message = 'Unauthorized',
  statusCode = 401
): void {
  res.status(statusCode).json({
    success: false,
    message
  });
}

/**
 * Handle unauthorized access for web routes
 * @param res - Next.js API response object
 * @param config - Web route configuration
 */
export function handleWebUnauthorized(
  res: NextApiResponse,
  config: WebRouteConfig
): void {
  const redirectUrl = config.redirectTo || '/login';
  res.redirect(302, redirectUrl);
}

/**
 * Handle insufficient permissions for API routes
 * @param res - Next.js API response object
 */
export function handleApiInsufficientPermissions(
  res: NextApiResponse
): void {
  res.status(403).json({
    success: false,
    message: 'Insufficient permissions'
  });
}

/**
 * Handle insufficient permissions for web routes
 * @param res - Next.js API response object
 */
export function handleWebInsufficientPermissions(
  res: NextApiResponse
): void {
  res.redirect(302, '/unauthorized');
}

/**
 * Handle email verification required for API routes
 * @param res - Next.js API response object
 */
export function handleApiVerificationRequired(
  res: NextApiResponse
): void {
  res.status(403).json({
    success: false,
    message: 'Email verification required',
    code: 'VERIFICATION_REQUIRED'
  });
}

/**
 * Handle email verification required for web routes
 * @param res - Next.js API response object
 */
export function handleWebVerificationRequired(
  res: NextApiResponse
): void {
  res.redirect(302, '/verify-email');
}

/**
 * Handle 2FA required for API routes
 * @param res - Next.js API response object
 */
export function handleApiTwoFactorRequired(
  res: NextApiResponse
): void {
  res.status(403).json({
    success: false,
    message: 'Two-factor authentication required',
    code: 'TWO_FACTOR_REQUIRED'
  });
}

/**
 * Handle 2FA required for web routes
 * @param res - Next.js API response object
 */
export function handleWebTwoFactorRequired(
  res: NextApiResponse
): void {
  res.redirect(302, '/two-factor');
}

/**
 * Handle rate limit exceeded for API routes
 * @param res - Next.js API response object
 */
export function handleApiRateLimitExceeded(
  res: NextApiResponse
): void {
  res.status(429).json({
    success: false,
    message: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED'
  });
}

/**
 * Handle middleware error for API routes
 * @param res - Next.js API response object
 * @param error - Error object
 */
export function handleApiError(
  res: NextApiResponse,
  error: Error
): void {
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}

/**
 * Handle middleware error for web routes
 * @param res - Next.js API response object
 */
export function handleWebError(
  res: NextApiResponse
): void {
  res.redirect(302, '/error');
} 