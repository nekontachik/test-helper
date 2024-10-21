import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { TestCaseFormData, TestCaseStatus, TestCasePriority } from '@/types';

interface TestCaseFormProps {
  onSubmit: (data: TestCaseFormData) => void;
  isLoading: boolean;
  initialData?: Partial<TestCaseFormData>;
}

export const TestCaseForm: React.FC<TestCaseFormProps> = ({
  onSubmit,
  isLoading,
  initialData,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestCaseFormData>({
    defaultValues: initialData,
  });

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={4}>
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters long' },
              maxLength: { value: 100, message: 'Title must not exceed 100 characters' },
            })}
          />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Description must be at least 10 characters long' },
            })}
          />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.expectedResult}>
          <FormLabel>Expected Result</FormLabel>
          <Textarea
            {...register('expectedResult', {
              required: 'Expected result is required',
              minLength: { value: 5, message: 'Expected result must be at least 5 characters long' },
            })}
          />
          <FormErrorMessage>{errors.expectedResult?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.status}>
          <FormLabel>Status</FormLabel>
          <Select {...register('status', { required: 'Status is required' })}>
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
          <Select {...register('priority', { required: 'Priority is required' })}>
            {Object.values(TestCasePriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
          <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isLoading}>
          {initialData ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </VStack>
    </Box>
  );
};
