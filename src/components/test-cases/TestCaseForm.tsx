import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { testCaseSchema, createTestCaseSchema, type TestCase, type CreateTestCase } from '@/lib/validations/testCase';

interface TestCaseFormProps {
  initialData?: Partial<TestCase>;
  onSubmit: (data: TestCase | CreateTestCase) => Promise<void>;
  isEditing?: boolean;
}

export function TestCaseForm({ initialData, onSubmit, isEditing }: TestCaseFormProps): JSX.Element {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TestCase | CreateTestCase>({
    resolver: zodResolver(isEditing ? testCaseSchema : createTestCaseSchema),
    defaultValues: initialData,
  });

  const onSubmitHandler = async (data: TestCase | CreateTestCase): Promise<void> => {
    try {
      await onSubmit(data);
      toast({
        title: `Test case ${isEditing ? 'updated' : 'created'} successfully`,
        status: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmitHandler)}>
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input {...register('title')} maxLength={200} />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.description}>
          <FormLabel>Description</FormLabel>
          <Textarea {...register('description')} maxLength={2000} />
          <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.priority}>
          <FormLabel>Priority</FormLabel>
          <Select {...register('priority')}>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
          <FormErrorMessage>{errors.priority?.message}</FormErrorMessage>
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          isLoading={isSubmitting}
          loadingText={isEditing ? "Updating..." : "Creating..."}
          w="full"
        >
          {isEditing ? 'Update Test Case' : 'Create Test Case'}
        </Button>
      </VStack>
    </Box>
  );
} 