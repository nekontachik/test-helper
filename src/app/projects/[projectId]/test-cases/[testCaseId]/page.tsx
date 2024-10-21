'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { Box, Heading, Spinner } from '@chakra-ui/react';
import { TestCaseDetails } from '@/components/TestCaseDetails';
import { useTestCase } from '@/hooks/useTestCase';

export default function TestCasePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const testCaseId = params?.testCaseId as string;

  const { data: testCase, isLoading, error } = useTestCase(projectId, testCaseId);

  if (isLoading) return <Spinner />;
  if (error) return <Box>Error: {error.message}</Box>;
  if (!testCase) return <Box>Test case not found</Box>;

  return (
    <Box>
      <Heading mb={6}>Test Case Details</Heading>
      <TestCaseDetails testCase={testCase} projectId={projectId} />
    </Box>
  );
}
