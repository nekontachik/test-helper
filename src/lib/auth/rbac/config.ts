import { RBACRule, UserRole, ActionType, ResourceType } from '@/types/rbac';

export const RBAC_RULES: RBACRule[] = [
  {
    role: 'ADMIN',
    permissions: [
      { action: ActionType.MANAGE, resource: ResourceType.PROJECT },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
      { action: ActionType.MANAGE, resource: ResourceType.USER },
      { action: ActionType.MANAGE, resource: ResourceType.REPORT },
    ],
  },
  {
    role: 'PROJECT_MANAGER',
    permissions: [
      { action: ActionType.CREATE, resource: ResourceType.PROJECT },
      { action: ActionType.READ, resource: ResourceType.PROJECT },
      { action: ActionType.UPDATE, resource: ResourceType.PROJECT },
      { action: ActionType.DELETE, resource: ResourceType.PROJECT },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
      { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
    ],
  },
  {
    role: 'TESTER',
    permissions: [
      { action: ActionType.READ, resource: ResourceType.PROJECT },
      { action: ActionType.CREATE, resource: ResourceType.TEST_CASE },
      { action: ActionType.READ, resource: ResourceType.TEST_CASE },
      { action: ActionType.UPDATE, resource: ResourceType.TEST_CASE },
      { action: ActionType.CREATE, resource: ResourceType.TEST_RUN },
      { action: ActionType.READ, resource: ResourceType.TEST_RUN },
    ],
  },
  {
    role: 'VIEWER',
    permissions: [
      { action: ActionType.READ, resource: ResourceType.PROJECT },
      { action: ActionType.READ, resource: ResourceType.TEST_CASE },
      { action: ActionType.READ, resource: ResourceType.TEST_RUN },
    ],
  },
]; 