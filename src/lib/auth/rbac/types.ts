import { isValidUserRole } from '@/lib/utils/typeGuards';
import { ROLE_CONFIG } from '@/constants/auth';

/**
 * User roles in the system
 */
export const UserRole = {
  GUEST: 'GUEST',
  USER: 'USER',
  TESTER: 'TESTER',
  EDITOR: 'EDITOR',
  VIEWER: 'VIEWER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  ADMIN: 'ADMIN'
} as const;

/**
 * Role type derived from UserRole object
 */
export type Role = (typeof UserRole)[keyof typeof UserRole];

/**
 * Action types for permissions
 */
export const Action = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE',
  EXECUTE: 'EXECUTE',
  ALL: '*'
} as const;

/**
 * Action type derived from Action object
 */
export type ActionType = (typeof Action)[keyof typeof Action];

/**
 * Resource types for permissions
 */
export const Resource = {
  PROJECT: 'PROJECT',
  TEST_CASE: 'TEST_CASE',
  TEST_RUN: 'TEST_RUN',
  REPORT: 'REPORT',
  USER: 'USER',
  SETTINGS: 'SETTINGS',
  TEAM: 'TEAM',
  ALL: '*'
} as const;

/**
 * Resource type derived from Resource object
 */
export type ResourceType = (typeof Resource)[keyof typeof Resource];

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  action: ActionType;
  resource: ResourceType;
  description: string;
  conditions?: {
    isOwner?: boolean;
    isTeamMember?: boolean;
    projectId?: string;
  };
}

/**
 * RBAC rule definition
 */
export interface RBACRule {
  role: Role;
  permissions: Permission[];
}

/**
 * RBAC context for permission checks
 */
export interface RBACContext {
  userId?: string;
  resourceOwnerId?: string;
  teamMembers?: string[];
  status?: string;
}

/**
 * Check if a string is a valid user role
 */
export function isUserRole(role: string): role is Role {
  return isValidUserRole(role);
}

/**
 * Assert that a string is a valid user role
 */
export function assertUserRole(role: string): asserts role is Role {
  if (!isValidUserRole(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

/**
 * Convert a string to a user role
 */
export function toUserRole(role: string): Role {
  assertUserRole(role);
  return role as Role;
}

/**
 * Check if a user has permission to perform an action on a resource
 * 
 * @param userRole - The user's role
 * @param action - The action to perform
 * @param resource - The resource to act upon
 * @returns Boolean indicating if the user has permission
 */
export function hasPermission(
  userRole: Role,
  action: ActionType,
  resource: ResourceType
): boolean {
  if (!isValidUserRole(userRole)) return false;
  
  // Admin has all permissions
  if (userRole === UserRole.ADMIN) return true;
  
  // Get permissions for this role from the RBAC rules
  const rolePermissions = RBAC_RULES.find(rule => rule.role === userRole)?.permissions || [];
  
  // Check if the role has this specific permission
  return rolePermissions.some(permission => 
    (permission.action === action || permission.action === Action.ALL) &&
    (permission.resource === resource || permission.resource === Resource.ALL)
  );
}

/**
 * Alternative function that accepts string format permissions
 * for backward compatibility
 */
export function hasStringPermission(userRole: Role, permission: string): boolean {
  if (!isValidUserRole(userRole)) return false;
  
  // Admin has all permissions
  if (userRole === UserRole.ADMIN) return true;
  
  // Get permissions for this role from ROLE_CONFIG
  const rolePermissions = ROLE_CONFIG.PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('*');
}

/**
 * RBAC rules configuration
 */
export const RBAC_RULES: RBACRule[] = [
  {
    role: UserRole.ADMIN,
    permissions: [
      { id: 'admin-all', action: Action.ALL, resource: Resource.ALL, description: 'Full system access' }
    ]
  },
  {
    role: UserRole.PROJECT_MANAGER,
    permissions: [
      { id: 'pm-project-manage', action: Action.MANAGE, resource: Resource.PROJECT, description: 'Manage projects' },
      { id: 'pm-testcase-manage', action: Action.MANAGE, resource: Resource.TEST_CASE, description: 'Manage test cases' },
      { id: 'pm-testrun-manage', action: Action.MANAGE, resource: Resource.TEST_RUN, description: 'Manage test runs' },
      { id: 'pm-user-read', action: Action.READ, resource: Resource.USER, description: 'View users' },
      { id: 'pm-report-manage', action: Action.MANAGE, resource: Resource.REPORT, description: 'Manage reports' },
      { id: 'pm-team-manage', action: Action.MANAGE, resource: Resource.TEAM, description: 'Manage teams' }
    ]
  },
  {
    role: UserRole.TESTER,
    permissions: [
      { id: 'tester-project-read', action: Action.READ, resource: Resource.PROJECT, description: 'View projects' },
      { id: 'tester-testcase-crud', action: Action.CREATE, resource: Resource.TEST_CASE, description: 'Create test cases' },
      { id: 'tester-testcase-read', action: Action.READ, resource: Resource.TEST_CASE, description: 'View test cases' },
      { id: 'tester-testcase-update', action: Action.UPDATE, resource: Resource.TEST_CASE, description: 'Update test cases' },
      { id: 'tester-testrun-execute', action: Action.EXECUTE, resource: Resource.TEST_RUN, description: 'Execute test runs' },
      { id: 'tester-report-read', action: Action.READ, resource: Resource.REPORT, description: 'View reports' }
    ]
  },
  {
    role: UserRole.EDITOR,
    permissions: [
      { id: 'editor-project-read', action: Action.READ, resource: Resource.PROJECT, description: 'View projects' },
      { id: 'editor-testcase-crud', action: Action.CREATE, resource: Resource.TEST_CASE, description: 'Create test cases' },
      { id: 'editor-testcase-read', action: Action.READ, resource: Resource.TEST_CASE, description: 'View test cases' },
      { id: 'editor-testcase-update', action: Action.UPDATE, resource: Resource.TEST_CASE, description: 'Update test cases' },
      { id: 'editor-report-read', action: Action.READ, resource: Resource.REPORT, description: 'View reports' }
    ]
  },
  {
    role: UserRole.VIEWER,
    permissions: [
      { id: 'viewer-project-read', action: Action.READ, resource: Resource.PROJECT, description: 'View projects' },
      { id: 'viewer-testcase-read', action: Action.READ, resource: Resource.TEST_CASE, description: 'View test cases' },
      { id: 'viewer-testrun-read', action: Action.READ, resource: Resource.TEST_RUN, description: 'View test runs' },
      { id: 'viewer-report-read', action: Action.READ, resource: Resource.REPORT, description: 'View reports' }
    ]
  },
  {
    role: UserRole.USER,
    permissions: [
      { id: 'user-project-read', action: Action.READ, resource: Resource.PROJECT, description: 'View projects' },
      { id: 'user-testcase-read', action: Action.READ, resource: Resource.TEST_CASE, description: 'View test cases' }
    ]
  }
]; 