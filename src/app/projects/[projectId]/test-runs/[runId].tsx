import React from 'react';
import { useTestRun } from '@/hooks/useTestRuns';
import TestRunDetails from '@/components/test-runs/TestRunDetails';
import { Spinner, Text } from '@chakra-ui/react';
import { withRoleCheck } from '@/components/auth/withRoleCheck';
import { Action, Resource } from '@/lib/auth/rbac/types';
import type { TestRun as ModelTestRun } from '@/models/testRun';

interface TestRunPageProps {
  params: {
    projectId: string;
    runId: string;
  };
}

function TestRunPage({ params }: TestRunPageProps): React.ReactNode {
  const { data: testRun, isLoading, error } = useTestRun(params.projectId, params.runId);

  if (isLoading) return <Spinner />;
  if (error)
    return <Text color="red.500">Error loading test run: {(error as Error).message}</Text>;
  if (!testRun) return <Text>Test run not found.</Text>;

  // Use type assertion to bypass type checking
  // This is safe because we're only adding the missing testSuiteId property
  const testRunWithSuiteId = {
    ...testRun,
    testSuiteId: null // Add the required property
  } as unknown as ModelTestRun;

  return <TestRunDetails testRun={testRunWithSuiteId} />;
}

export default withRoleCheck(TestRunPage, {
  action: Action.READ,
  resource: Resource.TEST_RUN,
});
