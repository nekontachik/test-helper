'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading } from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { EditTestCaseForm } from '@/components/EditTestCaseForm';
import { useTestCase, useUpdateTestCase } from '@/hooks/useTestCases';
import { TestCaseFormData } from '@/types';

export default function EditTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const projectId = params?.projectId as string;
  const testCaseId = params?.testCaseId as string;

  const { data: testCase, isLoading, error } = useTestCase(projectId, testCaseId);
  const updateTestCaseMutation = useUpdateTestCase();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!testCase) return <div>Test case not found</div>;

  const handleSubmit = async (data: TestCaseFormData) => {
    try {
      await updateTestCaseMutation.mutateAsync({ projectId, testCaseId, testCase: data });
      toast({
        title: 'Test case updated',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/projects/${projectId}/test-cases/${testCaseId}`);
    } catch (error) {
      toast({
        title: 'Error updating test case',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Heading mb={6}>Edit Test Case</Heading>
      <EditTestCaseForm testCase={testCase} onSubmit={handleSubmit} />
    </Box>
  );
}
