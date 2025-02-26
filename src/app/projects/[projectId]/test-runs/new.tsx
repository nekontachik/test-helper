'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateTestRun } from '@/hooks/useTestRuns';
import { useTestCases } from '@/hooks/useTestCases';
import { TestRunForm } from '@/components/TestRunForm';
import { Box, Heading, Spinner, Text, useToast } from '@chakra-ui/react';
import type { TestRunFormData, TestCase } from '@/types';
import { TestRunStatus } from '@/types';
import { TestCaseStatus } from '@/types/testCase';

export default function NewTestRunPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const projectId = params?.projectId as string;
  const createTestRun = useCreateTestRun();
  
  const { testCases, isLoading, error } = useTestCases({
    projectId,
    initialFilters: {
      status: [TestCaseStatus.ACTIVE],
      page: 1,
      limit: 100
    }
  });

  const handleSubmit = async (data: Omit<TestRunFormData, 'projectId' | 'status'>): Promise<void> => {
    try {
      const startTime = performance.now();
      await createTestRun.mutateAsync({
        projectId,
        testRun: {
          ...data,
          projectId,
          status: TestRunStatus.PENDING
        }
      });
      const duration = performance.now() - startTime;
      console.log(`Test run creation took ${duration}ms`);
      
      toast({
        title: 'Test Run created',
        description: 'Your test run has been created successfully.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      router.push(`/projects/${projectId}/test-runs`);
    } catch (error) {
      console.error('Error creating test run:', error);
      toast({
        title: 'Error creating test run',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to create test run. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!projectId) {
    return (
      <Text color="red.500">
        Project ID is required
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Box p={4} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" thickness="4px" speed="0.65s" />
      </Box>
    );
  }
  
  if (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to load test cases';
      
    return (
      <Box p={4}>
        <Text color="red.500">
          Error loading test cases: {errorMessage}
        </Text>
      </Box>
    );
  }

  if (!testCases || testCases.length === 0) {
    return (
      <Box p={4}>
        <Heading as="h1" mb={4}>Create New Test Run</Heading>
        <Text>
          No active test cases available. Please create and activate some test cases first.
        </Text>
      </Box>
    );
  }

  const formattedTestCases = testCases.map(tc => ({
    id: tc.id,
    title: tc.title,
    description: tc.description || '',
    status: tc.status
  }));

  return (
    <Box p={4}>
      <Heading as="h1" mb={4}>
        Create New Test Run
      </Heading>
      <TestRunForm
        onSubmit={handleSubmit}
        projectId={projectId}
        testCases={formattedTestCases as unknown as TestCase[]}
        isSubmitting={createTestRun.isPending}
      />
    </Box>
  );
} 