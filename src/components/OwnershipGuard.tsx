'use client';

import { useResourceOwnership } from '@/hooks/useResourceOwnership';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

interface OwnershipGuardProps {
  resourceType: 'project' | 'testCase' | 'testRun';
  resourceId: string;
  requireOwnership?: boolean;
  allowTeamMembers?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OwnershipGuard({
  resourceType,
  resourceId,
  requireOwnership = true,
  allowTeamMembers = false,
  children,
  fallback,
}: OwnershipGuardProps): React.ReactElement {
  const { isOwner, isTeamMember } = useResourceOwnership({
    resourceType,
    resourceId,
  });

  if (isOwner === null || isTeamMember === null) {
    return <Skeleton className="w-full h-24" />;
  }

  const hasAccess = isOwner || (allowTeamMembers && isTeamMember);

  if (!hasAccess) {
    return fallback ? 
      React.createElement(React.Fragment, null, fallback) : 
      (
        <Alert variant="destructive">
          <AlertDescription>
            {requireOwnership
              ? "You don't have permission to access this resource."
              : "You must be a team member to access this resource."}
          </AlertDescription>
        </Alert>
      );
  }

  return <>{children}</>;
} 