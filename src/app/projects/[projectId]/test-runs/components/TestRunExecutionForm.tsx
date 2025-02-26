'use client';

import React, { useMemo } from 'react';
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
import type { TestCase, TestCaseResultStatus } from '@/types';

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

// Define status options as a constant to prevent re-renders
const STATUS_OPTIONS = [
  { value: 'PASSED' as TestCaseResultStatus, label: 'Passed' },
  { value: 'FAILED' as TestCaseResultStatus, label: 'Failed' },
  { value: 'SKIPPED' as TestCaseResultStatus, label: 'Skipped' },
] as const;

export function TestRunExecutionForm({ testCases, onSubmit }: TestRunExecutionFormProps) {
  // Memoize default values to prevent unnecessary recalculations
  const defaultValues = useMemo(() => ({
    results: testCases.map((testCase) => ({
      testCaseId: testCase.id,
      status: 'PASSED' as TestCaseResultStatus, // Set default to PASSED instead of PENDING
      notes: '',
    })),
  }), [testCases]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: 'results',
  });

  const onSubmitForm = (data: FormData) => {
    onSubmit(data.results);
  };

  // Memoize the form fields to prevent unnecessary re-renders
  const formFields = useMemo(() => 
    fields.map((field, index) => {
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
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
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
    }), [fields, testCases, register, errors.results]);

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={6} align="stretch">
        {formFields}
        <Button type="submit" colorScheme="blue">
          Submit Results
        </Button>
      </VStack>
    </form>
  );
}
