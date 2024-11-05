'use client';

import { usePermissionCheck } from '@/hooks/usePermissionCheck';
import { ActionType, ResourceType } from '@/types/rbac';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface PermissionGuardProps {
  action: ActionType;
  resource: ResourceType;
  resourceId?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

export function PermissionGuard({
  action,
  resource,
  resourceId,
  children,
  fallback,
  loadingComponent,
}: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissionCheck({
    action,
    resource,
    resourceId,
  });

  if (isLoading) {
    return loadingComponent || <Skeleton className="w-full h-24" />;
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