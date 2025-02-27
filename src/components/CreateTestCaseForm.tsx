import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  FormErrorMessage,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import type { TestCaseFormData} from '@/types';
import { TestCasePriority, TestCaseStatus } from '@/types';

interface CreateTestCaseFormProps {
  onSubmit: (data: TestCaseFormData) => void;
  projectId: string;
}

export function CreateTestCaseForm({
  onSubmit,
  projectId,
}: CreateTestCaseFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestCaseFormData>();

  const onFormSubmit = (data: TestCaseFormData): void => {
    onSubmit({ ...data, projectId });
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel htmlFor="title">Title</FormLabel>
          <Input
            id="title"
            {...register('title', { required: 'Title is required' })}
          />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            {...register('description', { required: 'Description is required' })}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.expectedResult}>
          <FormLabel htmlFor="expectedResult">Expected Result</FormLabel>
          <Textarea
            id="expectedResult"
            {...register('expectedResult', { required: 'Expected result is required' })}
          />
          <FormErrorMessage>{errors.expectedResult?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.status}>
          <FormLabel htmlFor="status">Status</FormLabel>
          <Select
            id="status"
            {...register('status', { required: 'Status is required' })}
          >
            {Object.values(TestCaseStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.status?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.priority}>
          <FormLabel htmlFor="priority">Priority</FormLabel>
          <Select
            id="priority"
            {...register('priority', { required: 'Priority is required' })}
          >
            {Object.values(TestCasePriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Create Test Case
        </Button>
      </VStack>
    </Box>
  );
}
