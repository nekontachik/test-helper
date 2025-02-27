'use client';

import React from 'react';
import { Box, Heading, VStack, Spinner } from '@chakra-ui/react';
import { useTestCase } from '@/hooks/useTestCase';
import { ErrorMessage } from '@/components/ErrorMessage';
import { TestCaseForm } from '@/components/TestCaseForm';
import type { TestCaseFormData } from '@/types';

interface TestCasePageProps {
  params: {
    projectId: string;
    testCaseId: string;
  };
}

export default function TestCasePage({ params }: TestCasePageProps): React.ReactNode {
  const { projectId, testCaseId } = params;
  const { data: testCase, isLoading, isError } = useTestCase(projectId, testCaseId);

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <ErrorMessage message="Failed to load test case" />;
  }

  if (!testCase) {
    return <ErrorMessage message="Test case not found" />;
  }

  const handleSubmit = async (data: TestCaseFormData): Promise<void> => {
    // Handle form submission here
    console.log('Form submitted:', data);
  };

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <Heading>{testCase.title}</Heading>
        <TestCaseForm 
          testCase={testCase} 
          projectId={projectId}
          onSubmit={handleSubmit}
        />
      </VStack>
    </Box>
  );
}
