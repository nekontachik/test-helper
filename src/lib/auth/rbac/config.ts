import { UserRole, Action, Resource } from '@/types/rbac';

interface RBACRule {
  role: UserRole;
  permissions: Array<{
    action: Action;
    resource: Resource;
  }>;
}

export const RBAC_RULES: RBACRule[] = [
  {
    role: UserRole.ADMIN,
    permissions: [
      { action: Action.MANAGE, resource: Resource.PROJECT },
      { action: Action.MANAGE, resource: Resource.TEST_CASE },
      { action: Action.MANAGE, resource: Resource.TEST_RUN },
      { action: Action.MANAGE, resource: Resource.USER },
      { action: Action.MANAGE, resource: Resource.REPORT },
    ],
  },
  {
    role: UserRole.PROJECT_MANAGER,
    permissions: [
      { action: Action.CREATE, resource: Resource.PROJECT },
      { action: Action.READ, resource: Resource.PROJECT },
      { action: Action.UPDATE, resource: Resource.PROJECT },
      { action: Action.DELETE, resource: Resource.PROJECT },
      { action: Action.MANAGE, resource: Resource.TEST_CASE },
      { action: Action.MANAGE, resource: Resource.TEST_RUN },
      { action: Action.READ, resource: Resource.USER },
      { action: Action.CREATE, resource: Resource.REPORT },
      { action: Action.READ, resource: Resource.REPORT },
    ],
  },
  {
    role: UserRole.TESTER,
    permissions: [
      { action: Action.READ, resource: Resource.PROJECT },
      { action: Action.CREATE, resource: Resource.TEST_CASE },
      { action: Action.READ, resource: Resource.TEST_CASE },
      { action: Action.UPDATE, resource: Resource.TEST_CASE },
      { action: Action.CREATE, resource: Resource.TEST_RUN },
      { action: Action.READ, resource: Resource.TEST_RUN },
      { action: Action.UPDATE, resource: Resource.TEST_RUN },
      { action: Action.READ, resource: Resource.REPORT },
    ],
  },
  {
    role: UserRole.VIEWER,
    permissions: [
      { action: Action.READ, resource: Resource.PROJECT },
      { action: Action.READ, resource: Resource.TEST_CASE },
      { action: Action.READ, resource: Resource.TEST_RUN },
      { action: Action.READ, resource: Resource.REPORT },
    ],
  },
]; 