import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { TestRunFormData } from '@/types';

interface CreateTestRunFormProps {
  onSubmit: (data: TestRunFormData) => void;
  projectId: string;
}

export function CreateTestRunForm({ onSubmit, projectId }: CreateTestRunFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestRunFormData>();

  const onFormSubmit = (data: TestRunFormData) => {
    onSubmit({ ...data, projectId });
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onFormSubmit)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Test Run Name</FormLabel>
          <Input
            id="name"
            {...register('name', { required: 'Test run name is required' })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Create Test Run
        </Button>
      </VStack>
    </Box>
  );
}
