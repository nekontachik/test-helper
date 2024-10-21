import React from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  VStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
} from '@chakra-ui/react';
import { TestCase as BaseTestCase } from '@/types';

interface TestSuiteFormTestCase extends Omit<BaseTestCase, 'description'> {
  description: string;
}

interface TestSuiteFormData {
  name: string;
  description: string;
  testCaseIds: string[];
}

interface TestSuiteFormProps {
  onSubmit: (data: TestSuiteFormData) => void;
  initialData?: Partial<TestSuiteFormData>;
  testCases: TestSuiteFormTestCase[];
}

export const TestSuiteForm: React.FC<TestSuiteFormProps> = ({
  onSubmit,
  initialData,
  testCases,
}) => {
  // Use testCases in your component logic
  // For example:
  // const [selectedTestCases, setSelectedTestCases] = useState<string[]>(initialData?.testCaseIds || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestSuiteFormData>({
    defaultValues: initialData,
  });

  return (
    <Box
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white shadow-md rounded-lg p-6"
    >
      <VStack spacing={4} align="stretch">
        <FormControl isInvalid={!!errors.name}>
          <FormLabel htmlFor="name">Name</FormLabel>
          <Input
            id="name"
            placeholder="Test Suite Name"
            {...register('name', { required: 'Name is required' })}
          />
          <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            placeholder="Test Suite Description"
            {...register('description')}
          />
        </FormControl>

        <Button type="submit" colorScheme="blue">
          {initialData ? 'Update Test Suite' : 'Create Test Suite'}
        </Button>
      </VStack>
    </Box>
  );
};
