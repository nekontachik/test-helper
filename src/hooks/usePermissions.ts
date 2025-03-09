import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { hasPermission } from '@/lib/auth/rbac/permissions';
import type { ActionType, ResourceType, Permission, Role } from '@/lib/auth/rbac/types';
import { UserRole } from '@/types/auth';

interface PermissionsHook {
  can: (action: ActionType, resource: ResourceType, conditions?: Permission['conditions']) => boolean;
  canAny: (permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>) => boolean;
  canAll: (permissions: Array<{ action: ActionType; resource: ResourceType; conditions?: Permission['conditions'] }>) => boolean;
  role: Role | undefined;
}

export function usePermissions(): PermissionsHook {
  const { user } = useSupabaseAuth();
  // Get user role from Supabase user metadata
  // Default to USER role if not specified
  const userRole = (user?.user_metadata?.role as Role) || UserRole.USER;

  const can = (
    action: ActionType,
    resource: ResourceType,
    conditions?: Permission['conditions']
  ): boolean => {
    if (!user || !userRole) return false;
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
