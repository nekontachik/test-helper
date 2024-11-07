export enum UserRole {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  TESTER = 'TESTER',
  VIEWER = 'VIEWER',
  USER = 'USER'
}

export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage'
}

export enum Resource {
  PROJECT = 'project',
  TEST_CASE = 'test_case',
  TEST_RUN = 'test_run',
  TEST_SUITE = 'test_suite',
  USER = 'user',
  REPORT = 'report',
  SETTINGS = 'settings'
}

export interface Permission {
  action: Action;
  resource: Resource;
  conditions?: {
    isOwner?: boolean;
    teamMember?: boolean;
  };
}

export interface ResourceContext {
  userId?: string;
  resourceOwnerId?: string;
  projectId?: string;
  teamMembers?: string[];
}

export interface RBACRule {
  role: UserRole;
  permissions: Permission[];
} 