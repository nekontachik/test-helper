'use client';

import React from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Button,
  Box,
  Text,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { TestCase, TestCaseResultStatus } from '@/types';

interface TestRunExecutionFormProps {
  testCases: TestCase[];
  submitUrl: string;
  onSubmitComplete?: () => void;
}

interface TestCaseResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes: string;
}

interface FormData {
  results: TestCaseResult[];
}

export function TestRunExecutionForm({ testCases, submitUrl, onSubmitComplete }: TestRunExecutionFormProps): JSX.Element {
  const toast = useToast();
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      results: testCases.map((testCase) => ({
        testCaseId: testCase.id,
        status: 'PENDING' as TestCaseResultStatus,
        notes: '',
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: 'results',
  });

  const onSubmitForm = async (data: FormData): Promise<void> => {
    try {
      const response = await fetch(submitUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data.results),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit results');
      }
      
      toast({
        title: 'Results submitted successfully',
        status: 'success',
        duration: 3000,
      });
      
      if (onSubmitComplete) {
        onSubmitComplete();
      }
    } catch (error) {
      toast({
        title: 'Error submitting results',
        description: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={6} align="stretch">
        {fields.map((field, index) => {
          const testCase = testCases[index];
          return (
            <Box key={field.id} p={4} borderWidth={1} borderRadius="md">
              <Text fontWeight="bold" mb={2}>
                {testCase.title}
              </Text>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.results?.[index]?.status}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    {...register(`results.${index}.status`, {
                      required: 'Status is required',
                    })}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PASSED">Passed</option>
                    <option value="FAILED">Failed</option>
                    <option value="SKIPPED">Skipped</option>
                  </Select>
                  <FormErrorMessage>
                    {errors.results?.[index]?.status?.message}
                  </FormErrorMessage>
                </FormControl>

                <FormControl>
                  <FormLabel>Notes</FormLabel>
                  <Textarea {...register(`results.${index}.notes`)} />
                </FormControl>
              </VStack>
            </Box>
          );
        })}

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Submit Results
        </Button>
      </VStack>
    </form>
  );
}
