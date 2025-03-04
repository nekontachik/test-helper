/**
 * @file Permission-related type definitions
 * 
 * Defines the permission types and interfaces for the application's
 * role-based access control (RBAC) system.
 */

import type { UserRole } from './roles';

/**
 * Permission resource types
 */
export enum Resource {
  USER = 'user',
  PROJECT = 'project',
  TEST_CASE = 'test_case',
  TEST_RUN = 'test_run',
  REPORT = 'report',
  SETTING = 'setting',
  TEAM = 'team',
  ORGANIZATION = 'organization',
  AUDIT_LOG = 'audit_log'
}

/**
 * Permission action types
 */
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  EXECUTE = 'execute',
  MANAGE = 'manage',
  ASSIGN = 'assign',
  APPROVE = 'approve',
  EXPORT = 'export',
  IMPORT = 'import',
  ALL = '*'
}

/**
 * Permission definition
 */
export interface Permission {
  id: string;
  action: Action;
  resource: Resource;
  description: string | null;
}

/**
 * Permission check parameters
 */
export interface PermissionParams {
  action: Action;
  resource: Resource;
  resourceId?: string;
}

/**
 * Role-based permission mapping
 */
export type RolePermissions = Record<UserRole, string[]>;

/**
 * Permission check result with reason
 */
export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
} 