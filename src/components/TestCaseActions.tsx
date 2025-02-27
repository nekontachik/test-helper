'use client';

import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Action, Resource } from '@/lib/auth/rbac/types';
import { useRouter } from 'next/navigation';

interface TestCaseActionsProps {
  testCaseId: string;
  editUrl: string;
  deleteUrl: string;
}

export function TestCaseActions({ testCaseId, editUrl, deleteUrl }: TestCaseActionsProps): JSX.Element {
  const router = useRouter();
  
  return (
    <div className="flex gap-2">
      <PermissionGuard
        action={Action.UPDATE}
        resource={Resource.TEST_CASE}
        resourceId={testCaseId}
      >
        <Button onClick={() => router.push(editUrl)}>Edit</Button>
      </PermissionGuard>

      <PermissionGuard
        action={Action.DELETE}
        resource={Resource.TEST_CASE}
        resourceId={testCaseId}
      >
        <Button variant="destructive" onClick={() => router.push(deleteUrl)}>
          Delete
        </Button>
      </PermissionGuard>
    </div>
  );
} 