import React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  FormErrorMessage,
} from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/checkbox';
import { useForm } from 'react-hook-form';
import { TestRunFormData, TestCase } from '@/types';

interface TestRunFormProps {
  onSubmit: (data: TestRunFormData) => void;
  projectId: string;
  testCases: TestCase[];
  isSubmitting: boolean;
}

export function TestRunForm({ onSubmit, projectId, testCases, isSubmitting }: TestRunFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
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

        <FormControl>
          <FormLabel>Select Test Cases</FormLabel>
          {testCases.map((testCase) => (
            <Checkbox key={testCase.id} {...register('testCaseIds')}>
              {testCase.title}
            </Checkbox>
          ))}
        </FormControl>

        <Button type="submit" colorScheme="blue" isLoading={isSubmitting}>
          Create Test Run
        </Button>
      </VStack>
    </Box>
  );
}