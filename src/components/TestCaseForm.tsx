'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  FormErrorMessage,
} from '@chakra-ui/react';
import { TestCase, TestCaseStatus, TestCasePriority, TestCaseFormData } from '@/types';

export interface TestCaseFormProps {
  testCase?: TestCase;  // Optional for create form
  projectId: string;
  onSubmit: (data: TestCaseFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TestCaseForm({ testCase, projectId, onSubmit, isLoading = false }: TestCaseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCaseFormData>({
    defaultValues: testCase ? {
      title: testCase.title,
      description: testCase.description,
      steps: testCase.steps,
      expectedResult: testCase.expectedResult,
      actualResult: testCase.actualResult,
      status: testCase.status,
      priority: testCase.priority,
      projectId: projectId,
    } : {
      title: '',
      description: '',
      steps: '',
      expectedResult: '',
      actualResult: '',
      status: TestCaseStatus.DRAFT,
      priority: TestCasePriority.MEDIUM,
      projectId: projectId,
    },
  });

  const onSubmitForm = async (data: TestCaseFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input
            {...register('title', {
              required: 'Title is required',
              maxLength: { value: 200, message: 'Title is too long' },
            })}
          />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            {...register('description', {
              maxLength: { value: 2000, message: 'Description is too long' },
            })}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.steps}>
          <FormLabel>Steps</FormLabel>
          <Textarea
            {...register('steps', {
              required: 'Steps are required',
            })}
          />
          <FormErrorMessage>{errors.steps?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.expectedResult}>
          <FormLabel>Expected Result</FormLabel>
          <Textarea
            {...register('expectedResult', {
              required: 'Expected result is required',
            })}
          />
          <FormErrorMessage>{errors.expectedResult?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.actualResult}>
          <FormLabel>Actual Result</FormLabel>
          <Textarea {...register('actualResult')} />
          <FormErrorMessage>{errors.actualResult?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.status}>
          <FormLabel>Status</FormLabel>
          <Select {...register('status')}>
            {Object.values(TestCaseStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.priority}>
          <FormLabel>Priority</FormLabel>
          <Select {...register('priority')}>
            {Object.values(TestCasePriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          {testCase ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </VStack>
    </form>
  );
}
