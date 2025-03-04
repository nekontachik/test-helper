import { UserRole } from '@/types/auth/roles';
import { createRBACMiddleware } from './middleware';

/**
 * Admin-only middleware
 * Restricts access to admin users only
 * Requires email verification and 2FA
 */
export const adminOnly = createRBACMiddleware(
  [UserRole.ADMIN], 
  { requireVerified: true, require2FA: true }
);

/**
 * Project manager middleware
 * Allows access to project managers and admins
 * Requires email verification
 */
export const projectManagerOnly = createRBACMiddleware(
  [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
  { requireVerified: true }
);

/**
 * Authenticated users middleware
 * Only checks that the user is authenticated
 * No role, verification, or 2FA requirements
 */
export const authenticated = createRBACMiddleware();

/**
 * Verified users middleware
 * Requires email verification
 * No specific role requirements
 */
export const verified = createRBACMiddleware(
  undefined,
  { requireVerified: true }
); 