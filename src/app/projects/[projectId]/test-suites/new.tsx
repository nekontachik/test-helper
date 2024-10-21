'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateTestSuite } from '@/hooks/useTestSuites';
import { useTestCases } from '@/hooks/useTestCases';
import { TestSuiteForm } from '@/components/TestSuiteForm';
import { Box, Heading, Spinner, Text } from '@chakra-ui/react';
import { TestSuiteFormData, TestCase } from '@/types';

export default function NewTestSuitePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const createTestSuite = useCreateTestSuite(projectId);
  const { data: testCases, isLoading, error } = useTestCases(projectId);

  const handleSubmit = async (data: Omit<TestSuiteFormData, 'projectId'>) => {
    try {
      await createTestSuite.mutateAsync({ ...data, projectId });
      router.push(`/projects/${projectId}/test-suites`);
    } catch (error) {
      console.error('Error creating test suite:', error);
    }
  };

  if (isLoading) return <Spinner />;
  if (error)
    return (
      <Text color="red.500">Error loading test cases: {error.message}</Text>
    );

  return (
    <Box>
      <Heading as="h1" mb={4}>
        Create New Test Suite
      </Heading>
      {testCases && testCases.data.length > 0 ? (
        <TestSuiteForm
          onSubmit={handleSubmit}
          testCases={testCases.data.map((tc: TestCase) => ({
            ...tc,
            description: tc.description || '', // Provide a default empty string if description is undefined
          }))}
        />
      ) : (
        <Text>
          No test cases available. Please create some test cases first.
        </Text>
      )}
    </Box>
  );
}
