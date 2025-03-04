import type { AuthToken } from './types';
import type { UserRole } from '@/types/auth';

/**
 * Check if a user has the required role(s) to access a resource
 * @param userRole - The role of the authenticated user
 * @param requiredRoles - Single role or array of roles required for access
 * @returns Boolean indicating if user has sufficient permissions
 */
export function hasRequiredRole(
  userRole: UserRole,
  requiredRoles?: UserRole | UserRole[]
): boolean {
  // If no roles are required, allow access
  if (!requiredRoles) {
    return true;
  }

  // Convert single role to array for consistent handling
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Check if user's role is in the required roles
  return roles.includes(userRole);
}

/**
 * Check if a token has the required role(s)
 * @param token - The decoded auth token
 * @param requiredRoles - Single role or array of roles required for access
 * @returns Boolean indicating if token has sufficient permissions
 */
export function tokenHasRequiredRole(
  token: AuthToken,
  requiredRoles?: UserRole | UserRole[]
): boolean {
  return hasRequiredRole(token.role, requiredRoles);
}

/**
 * Check if a token has verified email if required
 * @param token - The decoded auth token
 * @param requireVerified - Whether verification is required
 * @returns Boolean indicating if token meets verification requirements
 */
export function tokenMeetsVerificationRequirement(
  token: AuthToken,
  requireVerified?: boolean
): boolean {
  if (!requireVerified) {
    return true;
  }
  
  return Boolean(token.isVerified);
}

/**
 * Check if a token has 2FA enabled if required
 * @param token - The decoded auth token
 * @param requireTwoFactor - Whether 2FA is required
 * @returns Boolean indicating if token meets 2FA requirements
 */
export function tokenMeetsTwoFactorRequirement(
  token: AuthToken,
  requireTwoFactor?: boolean
): boolean {
  if (!requireTwoFactor) {
    return true;
  }
  
  return Boolean(token.isTwoFactorEnabled);
} 