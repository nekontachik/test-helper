'use client';

import React from 'react';
import { VStack, FormControl, FormLabel, Input, Textarea, Select, Button, Text } from '@chakra-ui/react';
import { createFormHook } from '@/lib/hooks/createFormHook';
import { useCreateTestCase, useUpdateTestCase } from '@/hooks/useTestCaseMutations';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';
import { testCaseSchema, type TestCaseFormData } from '@/lib/validations/testCase';

interface TestCaseFormProps {
  testCase?: TestCase;
  projectId: string;
}

export function TestCaseForm({ testCase, projectId }: TestCaseFormProps): JSX.Element {
  const createTestCase = useCreateTestCase();
  const updateTestCase = useUpdateTestCase();

  const { form, handleSubmit, isSubmitting } = createFormHook({
    schema: testCaseSchema,
    defaultValues: testCase ? {
      ...testCase,
      projectId
    } : {
      status: TestCaseStatus.DRAFT,
      priority: TestCasePriority.MEDIUM,
      projectId
    },
    onSubmit: async (data: TestCaseFormData): Promise<void> => {
      if (testCase) {
        await updateTestCase.mutateAsync({ id: testCase.id, data });
      } else {
        await createTestCase.mutateAsync(data);
      }
    }
  })();

  const { register, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title')} />
          {errors.title && (
            <Text color="red.500" fontSize="sm">{errors.title.message}</Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description')} />
          {errors.description && (
            <Text color="red.500" fontSize="sm">{errors.description.message}</Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.steps}>
          <FormLabel>Steps</FormLabel>
          <Textarea {...register('steps')} />
          {errors.steps && (
            <Text color="red.500" fontSize="sm">{errors.steps.message}</Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.expectedResult}>
          <FormLabel>Expected Result</FormLabel>
          <Textarea {...register('expectedResult')} />
          {errors.expectedResult && (
            <Text color="red.500" fontSize="sm">{errors.expectedResult.message}</Text>
          )}
        </FormControl>

        <FormControl isInvalid={!!errors.actualResult}>
          <FormLabel>Actual Result</FormLabel>
          <Textarea {...register('actualResult')} />
          {errors.actualResult && (
            <Text color="red.500" fontSize="sm">{errors.actualResult.message}</Text>
          )}
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
          {errors.status && (
            <Text color="red.500" fontSize="sm">{errors.status.message}</Text>
          )}
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
          {errors.priority && (
            <Text color="red.500" fontSize="sm">{errors.priority.message}</Text>
          )}
        </FormControl>

        <Button 
          type="submit" 
          colorScheme="blue"
          isLoading={isSubmitting}
        >
          {testCase ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </VStack>
    </form>
  );
}
