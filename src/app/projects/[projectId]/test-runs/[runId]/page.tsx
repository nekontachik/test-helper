'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Box, Button, Heading, useDisclosure } from '@chakra-ui/react';
import { useTestRun } from '@/hooks/useTestRuns';
import { TestRunDetails } from '@/components/test-run/TestRunDetails';
import { GenerateReport } from '@/components/test-run/GenerateReport';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { TestRunStatus } from '@/types';

export default function TestRunPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const runId = params?.runId as string;
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const { data: testRun, isLoading, error } = useTestRun(projectId, runId);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorAlert error={error} />;
  if (!testRun) return <ErrorAlert message="Test run not found" />;

  return (
    <Box className="container mx-auto py-8">
      <Box className="flex justify-between items-center mb-6">
        <Heading>Test Run: {testRun.name}</Heading>
        {testRun.status === TestRunStatus.COMPLETED && (
          <Button colorScheme="blue" onClick={onOpen}>
            Generate Report
          </Button>
        )}
      </Box>
      
      <TestRunDetails testRun={testRun} />
      
      <GenerateReport
        projectId={projectId}
        runId={runId}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Box>
  );
} 