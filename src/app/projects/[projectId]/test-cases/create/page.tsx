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
  const { mutate: createTestCase, isLoading } = useCreateTestCase(projectId);

  const handleSubmit = (data: TestCaseFormData) => {
    createTestCase(data, {
      onSuccess: () => {
        router.push(`/projects/${projectId}/test-cases`);
      },
    });
  };

  return (
    <Box>
      <Heading mb={6}>Create Test Case</Heading>
      <TestCaseForm onSubmit={handleSubmit} isLoading={isLoading} />
    </Box>
  );
}
