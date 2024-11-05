'use client';

import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/PermissionGuard';
import { Action, Resource } from '@/lib/auth/rbac/types';

interface TestCaseActionsProps {
  testCaseId: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function TestCaseActions({ testCaseId, onEdit, onDelete }: TestCaseActionsProps) {
  return (
    <div className="flex gap-2">
      <PermissionGuard
        action={Action.UPDATE}
        resource={Resource.TEST_CASE}
        resourceId={testCaseId}
      >
        <Button onClick={onEdit}>Edit</Button>
      </PermissionGuard>

      <PermissionGuard
        action={Action.DELETE}
        resource={Resource.TEST_CASE}
        resourceId={testCaseId}
      >
        <Button variant="destructive" onClick={onDelete}>
          Delete
        </Button>
      </PermissionGuard>
    </div>
  );
} 