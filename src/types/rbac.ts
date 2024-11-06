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

export interface RBACContext {
  userId?: string;
  projectId?: string;
  teamId?: string;
}

export interface Permission {
  action: Action;
  resource: Resource;
  conditions?: Record<string, unknown>;
}

export interface Role {
  name: UserRole;
  permissions: Permission[];
} 