'use client';

import React, { useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading, Spinner, Text } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { useTestCases } from '@/hooks/useTestCases';
import { useCreateTestRun } from '@/hooks/useTestRuns';
import { TestRunForm } from '@/components/TestRunForm';
import type {
  TestRunFormData} from '@/types';
import {
  TestRunStatus,
  TestCase,
  TestCaseStatus,
  TestCasePriority,
} from '@/types';

export default function CreateTestRunPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const projectId = params?.projectId as string;
  const createTestRun = useCreateTestRun(projectId);
  const { data: testCases, isLoading, error } = useTestCases(projectId);

  const handleSubmit = useCallback(
    (data: TestRunFormData) => {
      createTestRun.mutate(
        {
          name: data.name,
          status: TestRunStatus.PENDING,
          testCases: data.testCaseIds.map((id) => ({
            id,
            title: '',
            description: '',
            expectedResult: '',
            status: TestCaseStatus.ACTIVE, // Changed from SKIPPED to ACTIVE
            priority: TestCasePriority.MEDIUM,
            projectId,
            createdAt: new Date(),
            updatedAt: new Date(),
          })),
          projectId,
        },
        {
          onSuccess: () => {
            toast({
              title: 'Test Run created.',
              description: 'Your new Test Run has been successfully created.',
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            router.push(`/projects/${projectId}/test-runs`);
          },
          onError: (error: unknown) => {
            console.error('Error creating test run:', error);
            toast({
              title: 'Error creating Test Run.',
              description:
                'There was an error creating your Test Run. Please try again.',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          },
        }
      );
    },
    [createTestRun, projectId, router, toast]
  );

  if (isLoading) return <Spinner size="xl" />;
  if (error)
    return (
      <Text color="red.500">Error loading test cases: {error.message}</Text>
    );
  if (!testCases || testCases.data.length === 0)
    return (
      <Text>No test cases available. Please create some test cases first.</Text>
    );

  return (
    <Box>
      <Heading as="h1" mb={4}>
        Create New Test Run
      </Heading>
      <TestRunForm
        onSubmit={handleSubmit}
        testCases={testCases.data}
        isSubmitting={createTestRun.isPending}
        projectId={projectId}
      />
    </Box>
  );
}
