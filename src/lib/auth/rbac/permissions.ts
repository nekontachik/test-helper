import { Role, Resource, Action, ActionType, ResourceType, Permission } from './types';

// Define base permissions that can be reused
const BASE_USER_PERMISSIONS: Permission[] = [
  { action: Action.READ, resource: Resource.PROJECT },
  { action: Action.READ, resource: Resource.TEST_CASE },
  { action: Action.READ, resource: Resource.TEST_RUN },
];

const BASE_TESTER_PERMISSIONS: Permission[] = [
  ...BASE_USER_PERMISSIONS,
  { action: Action.CREATE, resource: Resource.TEST_CASE },
  { action: Action.UPDATE, resource: Resource.TEST_CASE },
  { action: Action.EXECUTE, resource: Resource.TEST_RUN },
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  GUEST: [
    { action: Action.READ, resource: Resource.PROJECT },
  ],
  USER: BASE_USER_PERMISSIONS,
  TESTER: BASE_TESTER_PERMISSIONS,
  PROJECT_MANAGER: [
    ...BASE_TESTER_PERMISSIONS,
    { action: Action.CREATE, resource: Resource.PROJECT },
    { action: Action.UPDATE, resource: Resource.PROJECT },
    { action: Action.MANAGE, resource: Resource.TEST_RUN },
    { action: Action.CREATE, resource: Resource.REPORT },
  ],
  ADMIN: [
    { action: Action.MANAGE, resource: Resource.PROJECT },
    { action: Action.MANAGE, resource: Resource.TEST_CASE },
    { action: Action.MANAGE, resource: Resource.TEST_RUN },
    { action: Action.MANAGE, resource: Resource.REPORT },
    { action: Action.MANAGE, resource: Resource.USER },
    { action: Action.MANAGE, resource: Resource.SETTINGS },
  ],
};

export const hasPermission = (
  userRole: Role,
  action: ActionType,
  resource: ResourceType,
  conditions?: Permission['conditions']
): boolean => {
  const permissions = ROLE_PERMISSIONS[userRole];
  
  return permissions.some(permission => {
    // Check basic permission
    const hasBasicPermission = (
      permission.action === action &&
      permission.resource === resource
    ) || (
      permission.action === Action.MANAGE &&
      permission.resource === resource
    );

    if (!hasBasicPermission) return false;

    // Check conditions if they exist
    if (conditions && permission.conditions) {
      return Object.entries(conditions).every(([key, value]) => 
        permission.conditions?.[key as keyof typeof conditions] === value
      );
    }

    return true;
  });
}; 