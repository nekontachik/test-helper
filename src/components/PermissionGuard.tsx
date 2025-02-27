'use client';

import { useEffect, useState } from 'react';
import type { ActionType, ResourceType } from '@/lib/auth/rbac/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface PermissionGuardProps {
  action: ActionType;
  resource: ResourceType;
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
}: PermissionGuardProps): React.ReactElement {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    // Simulate permission check
    const checkPermission = (): void => {
      // This is a simplified version - in a real app, you would use the actual permission check
      // based on your permission structure
      setTimeout(() => {
        setHasPermission(true); // For demo purposes, always grant permission
      }, 500);
    };

    checkPermission();
  }, [action, resource, resourceId]);

  if (hasPermission === null) {
    return <Skeleton className="w-full h-24" />;
  }

  if (!hasPermission) {
    return fallback ? 
      React.createElement(React.Fragment, null, fallback) : 
      (
        <Alert variant="destructive">
          <AlertDescription>
            You don&apos;t have permission to {action} this {resource}.
          </AlertDescription>
        </Alert>
      );
  }

  return <>{children}</>;
} 