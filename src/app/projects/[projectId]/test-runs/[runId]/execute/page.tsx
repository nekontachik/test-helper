'use client';

import { useParams } from 'next/navigation';
import { Box, Heading } from '@chakra-ui/react';
import { ExecuteTestRun } from '@/components/test-run/ExecuteTestRun';
import { useTestRun } from '@/hooks/useTestRuns';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';

export default function TestRunExecutionPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const runId = params?.runId as string;
  
  const { data: testRun, isLoading, error } = useTestRun(projectId, runId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!testRun) return <ErrorAlert message="Test run not found" />;

  return (
    <ErrorBoundary>
      <Box className="container mx-auto py-8">
        <Heading mb={4}>Execute Test Run: {testRun.name}</Heading>
        <ExecuteTestRun 
          testRun={testRun}
          projectId={projectId}
          runId={runId}
        />
      </Box>
    </ErrorBoundary>
  );
} 