'use client';

import { Button } from '@/components/ui/button';
import { OwnershipGuard } from '@/components/OwnershipGuard';

interface TestCaseEditButtonProps {
  testCaseId: string;
  onEdit: () => void;
}

export function TestCaseEditButton({ testCaseId, onEdit }: TestCaseEditButtonProps) {
  return (
    <OwnershipGuard
      resourceType="testCase"
      resourceId={testCaseId}
      requireOwnership={true}
      allowTeamMembers={false}
    >
      <Button onClick={onEdit}>Edit Test Case</Button>
    </OwnershipGuard>
  );
} 