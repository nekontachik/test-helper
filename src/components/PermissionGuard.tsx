'use client';

import { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  action: Action;
  resource: Resource;
  resourceId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  action,
  resource,
  resourceId,
  children,
  fallback,
}: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { checkPermission } = usePermission({ action, resource, resourceId });

  useEffect(() => {
    const verifyPermission = async () => {
      const result = await checkPermission();
      setHasPermission(result);
    };

    verifyPermission();
  }, [action, resource, resourceId, checkPermission]);

  if (hasPermission === null) {
    return <Skeleton className="w-full h-24" />;
  }

  if (!hasPermission) {
    return fallback || (
      <Alert variant="destructive">
        <AlertDescription>
          You don't have permission to {action} this {resource}.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
} 