import { useSession } from 'next-auth/react';
import { Action, Resource } from '@/lib/auth/rbac/types';

interface UsePermissionOptions {
  action: Action;
  resource: Resource;
  resourceId?: string;
}

export function usePermission({ action, resource, resourceId }: UsePermissionOptions) {
  const { data: session } = useSession();

  const checkPermission = async (): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      const response = await fetch('/api/auth/permissions/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          resource,
          resourceId,
        }),
      });

      if (!response.ok) return false;
      const data = await response.json();
      return data.hasPermission;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  return { checkPermission };
} 