import React from 'react';
import { useParams } from 'next/navigation';
import { useTestRun } from '@/hooks/useTestRuns';
import { TestRunDetails } from '@/components/TestRunDetails';
import { Spinner, Text } from '@chakra-ui/react';

export default function TestRunPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const runId = params?.runId as string;

  const { data: testRun, isLoading, error } = useTestRun(projectId, runId);

  if (isLoading) return <Spinner />;
  if (error)
    return <Text color="red.500">Error loading test run: {error.message}</Text>;
  if (!testRun) return <Text>Test run not found.</Text>;

  return <TestRunDetails testRun={testRun} />;
}
