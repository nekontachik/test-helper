'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Box, Heading } from '@chakra-ui/react';
import { TestCaseForm } from '@/components/TestCaseForm';
import { useCreateTestCase } from '@/hooks/useTestCase';
import { TestCaseFormData } from '@/types';

export default function CreateTestCasePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const { mutateAsync: createTestCase, isLoading } = useCreateTestCase(projectId);

  const handleSubmit = async (data: TestCaseFormData) => {
    try {
      await createTestCase(data);
      router.push(`/projects/${projectId}/test-cases`);
    } catch (error) {
      console.error('Failed to create test case:', error);
    }
  };

  return (
    <Box>
      <Heading mb={6}>Create Test Case</Heading>
      <TestCaseForm 
        projectId={projectId}
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </Box>
  );
}
