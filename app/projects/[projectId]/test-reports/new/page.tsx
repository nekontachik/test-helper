'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/toast';
import { useCreateTestReport } from '@/hooks/useTestReports';

interface TestReportFormData {
  name: string;
}

export default function NewTestReportPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestReportFormData>();
  const createTestReport = useCreateTestReport();

  const onSubmit = async (data: TestReportFormData) => {
    try {
      await createTestReport.mutateAsync({ ...data, projectId });
      toast({
        title: 'Test Report created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      router.push(`/projects/${projectId}/test-reports`);
    } catch (error) {
      toast({
        title: 'Error creating Test Report.',
        description:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box p={4}>
      <Heading mb={6}>Generate New Test Report</Heading>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">Report Name</FormLabel>
            <Input
              id="name"
              {...register('name', { required: 'Report name is required' })}
            />
          </FormControl>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createTestReport.isLoading}
          >
            Generate Report
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
