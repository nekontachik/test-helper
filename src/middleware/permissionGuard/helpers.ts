import type { Action, Resource } from '@/types/rbac';
import type { PermissionGuardConfig } from './types';

/**
 * Create a permission guard configuration for a specific resource and action
 */
export function createPermissionGuard(
  resource: Resource,
  action: Action,
  options: Omit<PermissionGuardConfig, 'permissions'> = {}
): PermissionGuardConfig {
  return {
    ...options,
    permissions: [{ resource, action }]
  };
} 