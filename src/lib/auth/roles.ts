import { UserRole } from '@/types/auth';
import { isValidUserRole } from '@/lib/utils/typeGuards';

// Valid roles in the system
export const VALID_ROLES = Object.values(UserRole);

// Role hierarchy for permission checks
export const ROLE_HIERARCHY = {
  [UserRole.USER]: 10,
  [UserRole.VIEWER]: 20,
  [UserRole.EDITOR]: 70,
  [UserRole.TESTER]: 60,
  [UserRole.PROJECT_MANAGER]: 80,
  [UserRole.ADMIN]: 100,
} as const;

/**
 * Get role hierarchy level (higher number = more permissions)
 * @param role - Role to check
 * @returns number representing hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  switch (role) {
    case 'ADMIN': return 100;
    case 'PROJECT_MANAGER': return 80;
    case 'EDITOR': return 70;
    case 'TESTER': return 60;
    case 'VIEWER': return 20;
    case 'USER': return 10;
    default: return 0;
  }
}

/**
 * Check if a user has a required role or higher
 * @param userRole - The user's role
 * @param requiredRole - The role required for access
 * @returns Boolean indicating if the user has sufficient permissions
 */
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
}

/**
 * Check if a user has any of the required roles
 * @param userRole - The user's role
 * @param requiredRoles - Array of roles that grant access
 * @returns Boolean indicating if the user has any of the required roles
 */
export function hasAnyRequiredRole(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.some(role => hasRequiredRole(userRole, role));
}

/**
 * Validates if a string is a valid UserRole
 * @param role - Role to validate
 * @returns boolean indicating if role is valid
 */
export { isValidUserRole };

/**
 * Check if a role has at least the permissions of another role
 * @param userRole - The user's role
 * @param requiredLevel - The minimum role level required
 * @returns boolean indicating if user has sufficient permissions
 */
export function hasRoleLevel(userRole: UserRole, requiredLevel: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredLevel);
} 