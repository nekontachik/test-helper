import { UserRole } from '@/types/auth';
import { Action, Resource } from '@/types/rbac';
import { createPermissionGuard } from './helpers';
import type { PermissionGuardConfig } from './types';

/**
 * Common permission guard configurations
 */
export const PermissionGuards = {
  // User permissions
  viewUsers: createPermissionGuard(Resource.USER, Action.READ),
  manageUsers: createPermissionGuard(Resource.USER, Action.MANAGE, { 
    roles: [UserRole.ADMIN], 
    requireVerified: true 
  }),
  
  // Project permissions
  viewProjects: createPermissionGuard(Resource.PROJECT, Action.READ),
  createProject: createPermissionGuard(Resource.PROJECT, Action.CREATE, {
    roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    requireVerified: true
  }),
  editProject: createPermissionGuard(Resource.PROJECT, Action.UPDATE, {
    roles: [UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    requireVerified: true,
    checkOwnership: true
  }),
  
  // Test case permissions
  viewTestCases: createPermissionGuard(Resource.TEST_CASE, Action.READ),
  createTestCase: createPermissionGuard(Resource.TEST_CASE, Action.CREATE, {
    roles: [UserRole.TESTER, UserRole.PROJECT_MANAGER, UserRole.ADMIN],
    requireVerified: true
  }),
  
  // Admin permissions
  adminOnly: {
    roles: [UserRole.ADMIN],
    requireVerified: true,
    require2FA: true
  } as PermissionGuardConfig
}; 