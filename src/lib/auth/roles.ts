import { UserRole } from '@/types/auth';

// Valid roles in the system
export const VALID_ROLES: UserRole[] = [
  'ADMIN', 
  'MANAGER', 
  'EDITOR', 
  'TESTER', 
  'VIEWER', 
  'USER'
];

/**
 * Validates if a string is a valid UserRole
 * @param role - Role to validate
 * @returns boolean indicating if role is valid
 */
export function isValidUserRole(role: string | undefined): role is UserRole {
  if (!role) return false;
  return VALID_ROLES.includes(role as UserRole);
}

/**
 * Checks if a user has the required role(s)
 * @param userRole - The user's role
 * @param requiredRoles - Required role(s) for access
 * @returns boolean indicating if user has required role
 */
export function hasRequiredRole(
  userRole: UserRole | undefined, 
  requiredRoles: UserRole | UserRole[]
): boolean {
  if (!userRole || !isValidUserRole(userRole)) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(userRole);
  }
  
  return userRole === requiredRoles;
}

/**
 * Get role hierarchy level (higher number = more permissions)
 * @param role - Role to check
 * @returns number representing hierarchy level
 */
export function getRoleLevel(role: UserRole): number {
  switch (role) {
    case 'ADMIN': return 100;
    case 'MANAGER': return 80;
    case 'EDITOR': return 60;
    case 'TESTER': return 40;
    case 'VIEWER': return 20;
    case 'USER': return 10;
    default: return 0;
  }
}

/**
 * Check if a role has at least the permissions of another role
 * @param userRole - The user's role
 * @param requiredLevel - The minimum role level required
 * @returns boolean indicating if user has sufficient permissions
 */
export function hasRoleLevel(userRole: UserRole, requiredLevel: UserRole): boolean {
  return getRoleLevel(userRole) >= getRoleLevel(requiredLevel);
} 