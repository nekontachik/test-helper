export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TESTER' | 'VIEWER';

export type Role = UserRole;

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage'
}

export enum Resource {
  PROJECT = 'project',
  TEST_CASE = 'testCase',
  TEST_RUN = 'testRun',
  USER = 'user',
  REPORT = 'report'
}

export interface RBACContext {
  userId?: string;
  resourceOwnerId?: string;
  teamMembers?: string[];
  status?: string;
}

// Add type guard for UserRole
export function isUserRole(role: string): role is UserRole {
  return ['ADMIN', 'PROJECT_MANAGER', 'TESTER', 'VIEWER'].includes(role);
}

// Add type assertion function
export function assertUserRole(role: string): asserts role is UserRole {
  if (!isUserRole(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

// Add role conversion utility
export function toUserRole(role: string): UserRole {
  assertUserRole(role);
  return role;
} 