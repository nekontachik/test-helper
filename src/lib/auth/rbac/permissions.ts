import type { Role, ActionType, ResourceType, Permission } from './types';
import { Resource, Action } from './types';

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
  USER: [
    ...BASE_USER_PERMISSIONS,
    { action: Action.READ, resource: Resource.REPORT },
  ],
  TESTER: BASE_TESTER_PERMISSIONS,
  PROJECT_MANAGER: [
    ...BASE_TESTER_PERMISSIONS,
    { action: Action.MANAGE, resource: Resource.PROJECT },
    { action: Action.DELETE, resource: Resource.TEST_CASE },
    { action: Action.MANAGE, resource: Resource.TEST_RUN },
    { action: Action.MANAGE, resource: Resource.REPORT },
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

/**
 * Check if a user has permission to perform an action on a resource
 * 
 * @param userRole - The user's role
 * @param action - The action to perform
 * @param resource - The resource to act upon
 * @param conditions - Optional conditions for the permission check
 * @returns Boolean indicating if the user has permission
 */
export const hasPermission = (
  userRole: Role,
  action: ActionType,
  resource: ResourceType,
  conditions?: Permission['conditions']
): boolean => {
  // Admin has all permissions
  if (userRole === 'ADMIN') return true;
  
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

/**
 * Create a permission string from action and resource
 */
export function createPermissionString(action: ActionType, resource: ResourceType): string {
  return `${action}:${resource}`;
}

/**
 * Create a permission object
 */
export function createPermission(
  action: ActionType,
  resource: ResourceType,
  conditions?: Permission['conditions']
): Permission {
  return {
    action,
    resource,
    ...(conditions ? { conditions } : {})
  };
}

/**
 * Convert permission object to string format
 */
export function permissionToString(permission: Permission): string {
  return createPermissionString(permission.action, permission.resource);
}

/**
 * Convert permission string to object format
 */
export function stringToPermission(permissionString: string): Permission | null {
  const [actionStr, resourceStr] = permissionString.split(':');
  
  if (!actionStr || !resourceStr) return null;
  
  // Validate action
  if (!Object.values(Action).includes(actionStr as ActionType)) return null;
  
  // Validate resource
  if (!Object.values(Resource).includes(resourceStr as ResourceType)) return null;
  
  return {
    action: actionStr as ActionType,
    resource: resourceStr as ResourceType
  };
} 