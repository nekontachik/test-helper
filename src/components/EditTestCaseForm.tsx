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
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import {
  TestCase,
  TestCaseFormData,
  TestCaseStatus,
  TestCasePriority,
} from '@/types';

interface EditTestCaseFormProps {
  testCase: TestCase;
  onSubmit: (data: TestCaseFormData) => void;
  onCancel: () => void;
}

export function EditTestCaseForm({
  testCase,
  onSubmit,
  onCancel,
}: EditTestCaseFormProps) {
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
    },
  });

  const onSubmitForm = (data: TestCaseFormData) => {
    onSubmit({ ...data, projectId: testCase.projectId });
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmitForm)}>
      <VStack spacing={4} align="stretch">
        <Text>Editing Version: {testCase.version}</Text>
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title', { required: 'Title is required' })} />
        </FormControl>
        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description', { required: 'Description is required' })} />
        </FormControl>
        <FormControl isInvalid={!!errors.expectedResult}>
          <FormLabel>Expected Result</FormLabel>
          <Textarea {...register('expectedResult', { required: 'Expected result is required' })} />
        </FormControl>
        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select {...register('status')}>
            {Object.values(TestCaseStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Priority</FormLabel>
          <Select {...register('priority')}>
            {Object.values(TestCasePriority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue">
          Update Test Case (Create New Version)
        </Button>
        <Button onClick={onCancel} colorScheme="gray">
          Cancel
        </Button>
      </VStack>
    </Box>
  );
}
