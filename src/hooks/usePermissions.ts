import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/auth/rbac/permissions';
import type { ActionType, ResourceType, Permission, Role } from '@/lib/auth/rbac/types';

interface PermissionsHook {
  can: (action: ActionType, resource: ResourceType, conditions?: Permission['conditions']) => boolean;
  canAny: (permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>) => boolean;
  canAll: (permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>) => boolean;
  role: Role | undefined;
}

export function usePermissions(): PermissionsHook {
  const { data: session } = useSession();
  const userRole = session?.user?.role as Role | undefined;

  const can = (
    action: ActionType,
    resource: ResourceType,
    conditions?: Permission['conditions']
  ): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, action, resource, conditions);
  };

  const canAny = (
    permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>
  ): boolean => {
    return permissions.some(({ action, resource, conditions }) => 
      can(action, resource, conditions)
    );
  };

  const canAll = (
    permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>
  ): boolean => {
    return permissions.every(({ action, resource, conditions }) => 
      can(action, resource, conditions)
    );
  };

  return {
    can,
    canAny,
    canAll,
    role: userRole,
  };
}
