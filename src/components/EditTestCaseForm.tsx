import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type {
  TestCase,
  TestCaseFormData} from '@/types';
import {
  TestCaseStatus,
  TestCasePriority,
} from '@/types';

interface EditTestCaseFormProps {
  testCase: TestCase;
  onSubmit: (data: TestCaseFormData) => void;
  isLoading?: boolean;
}

export function EditTestCaseForm({
  testCase,
  onSubmit,
}: EditTestCaseFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCaseFormData>({
    defaultValues: {
      title: testCase.title,
      description: testCase.description,
      expectedResult: testCase.expectedResult,
      status: testCase.status,
      priority: testCase.priority,
      projectId: testCase.projectId,
      steps: testCase.steps,
      actualResult: testCase.actualResult,
    },
  });

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title', { required: 'Title is required' })} />
        </FormControl>
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description')} />
        </FormControl>
        <FormControl>
          <FormLabel>Steps</FormLabel>
          <Textarea {...register('steps')} />
        </FormControl>
        <FormControl>
          <FormLabel>Expected Result</FormLabel>
          <Textarea {...register('expectedResult')} />
        </FormControl>
        <FormControl>
          <FormLabel>Actual Result</FormLabel>
          <Textarea {...register('actualResult')} />
        </FormControl>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select {...register('status')}>
            {Object.values(TestCaseStatus).map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Priority</FormLabel>
          <Select {...register('priority')}>
            {Object.values(TestCasePriority).map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue">Update Test Case</Button>
      </VStack>
    </Box>
  );
}
