import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import type { Action, Resource } from '@/types/rbac';

interface UsePermissionCheckOptions {
  action: Action;
  resource: Resource;
  resourceId?: string;
}

export function usePermissionCheck({ action, resource, resourceId }: UsePermissionCheckOptions) {
  const { data: session } = useSession();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      if (!session?.user) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }

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

        if (!response.ok) throw new Error('Failed to check permission');

        const data = await response.json();
        setHasPermission(data.hasPermission);
      } catch (error) {
        console.error('Permission check error:', error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [session, action, resource, resourceId]);

  return { hasPermission, isLoading };
} 