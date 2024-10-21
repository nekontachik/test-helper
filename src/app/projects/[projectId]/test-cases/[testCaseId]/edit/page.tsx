'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading, Spinner } from '@chakra-ui/react';
import { TestCaseForm } from '@/components/TestCaseForm';
import { useTestCase, useUpdateTestCase } from '@/hooks/useTestCase';
import { TestCaseFormData } from '@/types';

export default function EditTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const testCaseId = params?.testCaseId as string;

  const { data: testCase, isLoading: isLoadingTestCase } = useTestCase(projectId, testCaseId);
  const { mutate: updateTestCase, isLoading: isUpdating } = useUpdateTestCase(projectId);

  const handleSubmit = (data: TestCaseFormData) => {
    updateTestCase({ testCaseId, data }, {
      onSuccess: () => {
        router.push(`/projects/${projectId}/test-cases/${testCaseId}`);
      },
    });
  };

  if (isLoadingTestCase) return <Spinner />;
  if (!testCase) return <Box>Test case not found</Box>;

  return (
    <Box>
      <Heading mb={6}>Edit Test Case</Heading>
      <TestCaseForm
        initialData={testCase}
        onSubmit={handleSubmit}
        isLoading={isUpdating}
      />
    </Box>
  );
}
