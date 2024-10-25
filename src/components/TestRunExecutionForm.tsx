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
} from '@chakra-ui/react';
import { useForm, useFieldArray } from 'react-hook-form';
import { TestCase, TestCaseResultStatus } from '@/types';

interface TestRunExecutionFormProps {
  testCases: TestCase[];
  onSubmit: (results: TestCaseResult[]) => void;
}

interface TestCaseResult {
  testCaseId: string;
  status: TestCaseResultStatus;
  notes: string;
}

interface FormData {
  results: TestCaseResult[];
}

export function TestRunExecutionForm({ testCases, onSubmit }: TestRunExecutionFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmitForm = (data: FormData) => {
    onSubmit(data.results);
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

        <Button type="submit" colorScheme="blue">
          Submit Results
        </Button>
      </VStack>
    </form>
  );
}
