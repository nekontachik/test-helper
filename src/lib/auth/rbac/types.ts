export const UserRole = {
  GUEST: 'GUEST',
  USER: 'USER',
  TESTER: 'TESTER',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  ADMIN: 'ADMIN'
} as const;

export type Role = (typeof UserRole)[keyof typeof UserRole];

export const Action = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  MANAGE: 'MANAGE',
  EXECUTE: 'EXECUTE'
} as const;

export type ActionType = (typeof Action)[keyof typeof Action];

export const Resource = {
  PROJECT: 'PROJECT',
  TEST_CASE: 'TEST_CASE',
  TEST_RUN: 'TEST_RUN',
  REPORT: 'REPORT',
  USER: 'USER',
  SETTINGS: 'SETTINGS'
} as const;

export type ResourceType = (typeof Resource)[keyof typeof Resource];

export interface Permission {
  action: ActionType;
  resource: ResourceType;
  conditions?: {
    isOwner?: boolean;
    isTeamMember?: boolean;
    projectId?: string;
  };
}

export interface RBACContext {
  userId?: string;
  resourceOwnerId?: string;
  teamMembers?: string[];
  status?: string;
}

// Type guard for UserRole
export function isUserRole(role: string): role is Role {
  return Object.values(UserRole).includes(role as Role);
}

// Type assertion function
export function assertUserRole(role: string): asserts role is Role {
  if (!isUserRole(role)) {
    throw new Error(`Invalid role: ${role}`);
  }
}

// Role conversion utility
export function toUserRole(role: string): Role {
  assertUserRole(role);
  return role as Role;
} 