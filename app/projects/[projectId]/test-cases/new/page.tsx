'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading } from '@chakra-ui/react';
import { TestCaseForm } from '@/components/TestCaseForm';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCaseFormData } from '@/types';
import { useToast } from '@/hooks/useToast';

export default function NewTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const queryClient = useQueryClient();
  const { showSuccessToast, showErrorToast } = useToast();

  const createTestCase = useMutation(
    (data: TestCaseFormData) => apiClient.createTestCase(projectId, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['testCases', projectId]);
        showSuccessToast('Test case created successfully');
        router.push(`/projects/${projectId}/test-cases`);
      },
      onError: (error: unknown) => {
        showErrorToast('Failed to create test case. Please try again.');
        console.error('Failed to create test case:', error);
      },
    }
  );

  const handleCreateTestCase = async (data: TestCaseFormData) => {
    createTestCase.mutate(data);
  };

  if (!projectId) {
    return <Box>Error: Project ID not found</Box>;
  }

  return (
    <Box p={4}>
      <Heading mb={6}>Create New Test Case</Heading>
      <TestCaseForm onSubmit={handleCreateTestCase} isLoading={createTestCase.isLoading} />
    </Box>
  );
}
