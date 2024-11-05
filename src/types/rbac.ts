export type UserRole = 'ADMIN' | 'PROJECT_MANAGER' | 'TESTER' | 'VIEWER';

export const UserRoles = {
  ADMIN: 'ADMIN',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  TESTER: 'TESTER',
  VIEWER: 'VIEWER'
} as const;

export enum ResourceType {
  PROJECT = 'project',
  TEST_CASE = 'test-case',
  TEST_RUN = 'test-run',
  USER = 'user',
  REPORT = 'report',
}

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
}

export interface Permission {
  action: ActionType;
  resource: ResourceType;
  conditions?: {
    isOwner?: boolean;
    teamMember?: boolean;
    status?: string[];
  };
}

export interface RBACRule {
  role: UserRole;
  permissions: Permission[];
}

export interface ResourceContext {
  userId?: string;
  resourceOwnerId?: string;
  teamMembers?: string[];
  status?: string;
  projectId?: string;
} 