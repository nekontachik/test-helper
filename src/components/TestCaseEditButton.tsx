'use client';

import { Button } from '@/components/ui/button';
import { OwnershipGuard } from '@/components/OwnershipGuard';
import { useRouter } from 'next/navigation';

interface TestCaseEditButtonProps {
  testCaseId: string;
  editUrl: string;
}

export function TestCaseEditButton({ testCaseId, editUrl }: TestCaseEditButtonProps): JSX.Element {
  const router = useRouter();
  
  return (
    <OwnershipGuard
      resourceType="testCase"
      resourceId={testCaseId}
      requireOwnership={true}
      allowTeamMembers={false}
    >
      <Button onClick={() => router.push(editUrl)}>Edit Test Case</Button>
    </OwnershipGuard>
  );
} 