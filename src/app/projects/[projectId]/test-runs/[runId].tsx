import React from 'react';
import { useParams } from 'next/navigation';
import { useTestRun } from '@/hooks/useTestRuns';
import TestRunDetails from '@/components/test-runs/TestRunDetails';
import { Spinner, Text } from '@chakra-ui/react';
import { withRoleCheck } from '@/components/auth/withRoleCheck';
import { Action, Resource } from '@/lib/auth/rbac/types';

interface TestRunPageProps {
  params: {
    projectId: string;
    runId: string;
  };
}

function TestRunPage({ params }: TestRunPageProps) {
  const { data: testRun, isLoading, error } = useTestRun(params.projectId, params.runId);

  if (isLoading) return <Spinner />;
  if (error)
    return <Text color="red.500">Error loading test run: {error.message}</Text>;
  if (!testRun) return <Text>Test run not found.</Text>;

  return <TestRunDetails testRun={testRun} />;
}

export default withRoleCheck(TestRunPage, {
  action: Action.READ,
  resource: Resource.TEST_RUN,
});
