import type { UserRole } from '@/types/auth';
import type { Action, Resource } from '@/types/rbac';

/**
 * Configuration for permission guard
 */
export interface PermissionGuardConfig {
  roles?: UserRole[];
  requireVerified?: boolean;
  require2FA?: boolean;
  permissions?: PermissionParams[];
  checkOwnership?: boolean;
}

/**
 * Permission parameters
 */
export interface PermissionParams {
  action: Action;
  resource: Resource;
}

/**
 * Type for role-based permissions mapping
 */
export type RolePermissionsMap = Record<UserRole, string[]>; 