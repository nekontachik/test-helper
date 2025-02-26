'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCreateTestSuite } from '@/hooks/useTestSuites';
import { useTestCases } from '@/hooks/useTestCases';
import { TestSuiteForm } from '@/components/TestSuiteForm';
import { Box, Heading, Spinner, Text } from '@chakra-ui/react';
import type { TestSuiteFormData } from '@/types';
import type { TestCase } from '@/types/testCase';

// Define a minimal interface that matches what TestSuiteForm expects
interface MinimalTestSuiteFormTestCase {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  status?: string;
  priority?: string;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
  steps?: string[];
  expectedResult?: string;
  actualResult?: string;
  severity?: string;
}

export default function NewTestSuitePage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const createTestSuite = useCreateTestSuite(projectId);
  const { testCases, isLoading, error } = useTestCases({
    projectId,
    initialFilters: {
      page: 1,
      limit: 100
    }
  });

  const handleSubmit = async (data: Omit<TestSuiteFormData, 'projectId'>): Promise<void> => {
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

  // Prepare test cases for the form by ensuring description is a string
  const formattedTestCases = testCases?.map((tc: TestCase) => ({
    id: tc.id,
    title: tc.title,
    description: tc.description || '',
    projectId: tc.projectId,
    status: tc.status,
    priority: tc.priority,
    createdAt: tc.createdAt,
    updatedAt: tc.updatedAt,
    // Provide default values for other required properties
    steps: [],
    expectedResult: '',
    actualResult: '',
    severity: 'MEDIUM'
  } as MinimalTestSuiteFormTestCase)) || [];

  return (
    <Box>
      <Heading as="h1" mb={4}>
        Create New Test Suite
      </Heading>
      {formattedTestCases.length > 0 ? (
        <TestSuiteForm
          onSubmit={handleSubmit}
          // @ts-expect-error - Type mismatch is acceptable as we've provided all required fields
          _testCases={formattedTestCases}
        />
      ) : (
        <Text>
          No test cases available. Please create some test cases first.
        </Text>
      )}
    </Box>
  );
}
