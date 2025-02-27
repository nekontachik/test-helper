'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Heading } from '@chakra-ui/react';
import { ExecuteTestRun } from '@/components/test-run/ExecuteTestRun';
import { useTestRun } from '@/hooks/useTestRuns';

export default function TestRunExecutionPage(): JSX.Element {
  const params = useParams();
  const projectId = params?.projectId as string;
  const runId = params?.runId as string;
  const { data: testRun, isLoading, error } = useTestRun(projectId, runId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!testRun) return <div>Test run not found</div>;

  return (
    <Box>
      <Heading mb={4}>Execute Test Run: {testRun.name}</Heading>
      <ExecuteTestRun 
        testRun={testRun} 
        projectId={projectId}
        runId={runId}
      />
    </Box>
  );
}
