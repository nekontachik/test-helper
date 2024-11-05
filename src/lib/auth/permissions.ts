import { Permission, ActionType, ResourceType, UserRoles } from '@/types/rbac';
import type { AuthUser } from './types';

type Role = keyof typeof UserRoles;

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    { action: ActionType.MANAGE, resource: ResourceType.PROJECT },
    { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
    { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
    { action: ActionType.MANAGE, resource: ResourceType.USER },
    { action: ActionType.MANAGE, resource: ResourceType.REPORT },
  ],
  PROJECT_MANAGER: [
    { action: ActionType.CREATE, resource: ResourceType.PROJECT },
    { action: ActionType.READ, resource: ResourceType.PROJECT },
    { action: ActionType.UPDATE, resource: ResourceType.PROJECT },
    { action: ActionType.MANAGE, resource: ResourceType.TEST_CASE },
    { action: ActionType.MANAGE, resource: ResourceType.TEST_RUN },
    { action: ActionType.MANAGE, resource: ResourceType.REPORT },
    { action: ActionType.READ, resource: ResourceType.USER },
  ],
  TESTER: [
    { action: ActionType.READ, resource: ResourceType.PROJECT },
    { action: ActionType.CREATE, resource: ResourceType.TEST_CASE },
    { action: ActionType.READ, resource: ResourceType.TEST_CASE },
    { action: ActionType.UPDATE, resource: ResourceType.TEST_CASE },
    { action: ActionType.CREATE, resource: ResourceType.TEST_RUN },
    { action: ActionType.READ, resource: ResourceType.TEST_RUN },
    { action: ActionType.UPDATE, resource: ResourceType.TEST_RUN },
    { action: ActionType.CREATE, resource: ResourceType.REPORT },
    { action: ActionType.READ, resource: ResourceType.REPORT },
  ],
  VIEWER: [
    { action: ActionType.READ, resource: ResourceType.PROJECT },
    { action: ActionType.READ, resource: ResourceType.TEST_CASE },
    { action: ActionType.READ, resource: ResourceType.TEST_RUN },
    { action: ActionType.READ, resource: ResourceType.REPORT },
  ]
};

export function hasPermission(user: AuthUser, permission: Permission): boolean {
  if (!user.permissions) return false;
  return user.permissions.some(p => 
    p.action === permission.action && 
    p.resource === permission.resource
  );
}

export function hasRole(user: AuthUser, role: Role): boolean {
  return user.role === role || user.roles?.includes(role) || false;
}

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

export function calculateUserPermissions(roles: Role[]): Permission[] {
  const allPermissions = roles.flatMap(role => ROLE_PERMISSIONS[role]);
  return Array.from(new Set(allPermissions.map(p => 
    JSON.stringify({ action: p.action, resource: p.resource })
  ))).map(p => JSON.parse(p));
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.some(p => 
    p.action === permission.action && 
    p.resource === permission.resource
  ) || false;
}

export function getPermissionsForRoles(roles: Role[]): Permission[] {
  return calculateUserPermissions(roles);
}

export function canAccessResource(
  user: AuthUser,
  action: ActionType,
  resource: ResourceType,
  context?: {
    isOwner?: boolean;
    teamMember?: boolean;
    status?: string;
  }
): boolean {
  // Check if user has MANAGE permission
  if (hasPermission(user, { action: ActionType.MANAGE, resource })) {
    return true;
  }

  // Check specific action permission
  const hasActionPermission = hasPermission(user, { action, resource });
  if (!hasActionPermission) {
    return false;
  }

  // Additional context-based checks
  if (context) {
    // Owner can always access their resources
    if (context.isOwner) {
      return true;
    }

    // Team members have access based on their role permissions
    if (context.teamMember && user.role !== 'VIEWER') {
      return true;
    }

    // Status-based restrictions
    if (context.status === 'ARCHIVED' && user.role !== 'ADMIN') {
      return false;
    }
  }

  return true;
} 