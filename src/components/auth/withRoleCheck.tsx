import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import type { ActionType, ResourceType, Permission } from '@/lib/auth/rbac/types';

interface RoleCheckConfig {
  action: ActionType;
  resource: ResourceType;
  conditions?: Permission['conditions'];
  redirectTo?: string;
}

export function withRoleCheck<P extends object>(
  Component: React.ComponentType<P>,
  { action, resource, conditions, redirectTo = '/unauthorized' }: RoleCheckConfig
) {
  return function ProtectedComponent(props: P) {
    const { can } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      if (!can(action, resource, conditions)) {
        router.push(redirectTo);
      }
    }, []);

    return <Component {...props} />;
  };
} 