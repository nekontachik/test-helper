import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Checkbox,
} from '@chakra-ui/react';
import { useTestCases } from '@/hooks/useTestCases';
import { useCreateTestRun } from '@/hooks/testRuns';
import type { TestCase, TestRunFormData } from '@/types';

// Type assertion helper for PaginatedResponse
interface PaginatedItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

const CreateTestRun: React.FC = (): React.ReactElement => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestRunFormData>();
  const { testCases, loading: isLoading, error } = useTestCases({ projectId });
  const createTestRun = useCreateTestRun({ showToasts: true });
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);

  // Move useMemo outside of conditional rendering to avoid React hooks rules violation
  const _formattedTestCases = useMemo(
    () => {
      if (!testCases) return [];
      
      // Type assertion to access items property
      const testCasesData = testCases as unknown as PaginatedItems<TestCase>;
      return testCasesData.items.map((tc: TestCase) => ({
        id: tc.id,
        title: tc.title,
        description: tc.description || '',
        status: tc.status,
        priority: tc.priority,
        expectedResult: tc.expectedResult || '',
        projectId: tc.projectId,
        createdAt: tc.createdAt,
        updatedAt: tc.updatedAt,
        version: tc.version,
      }));
    },
    [testCases]
  );

  const onSubmit = async (data: TestRunFormData): Promise<void> => {
    try {
      // Create a new test run with the selected test cases
      await createTestRun.mutateAsync({
        projectId,
        testRun: {
          name: data.name,
          projectId,
          testCaseIds: selectedTestCases,
          status: data.status || 'pending',
        },
      });

      // Redirect to the project page after successful creation
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Failed to create test run:', error);
    }
  };

  const handleTestCaseSelection = (testCaseId: string): void => {
    setSelectedTestCases((prev) =>
      prev.includes(testCaseId)
        ? prev.filter((id) => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  if (isLoading) {
    return <div>Loading test cases...</div>;
  }

  if (error) {
    return <div>Error loading test cases: {error.message}</div>;
  }

  return (
    <Box p={4}>
      <VStack spacing={4} align="stretch">
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isRequired mb={4}>
            <FormLabel>Test Run Name</FormLabel>
            <Input {...register('name', { required: true })} />
            {errors.name && <Text color="red">Name is required</Text>}
          </FormControl>

          <Box mb={4}>
            <Text fontWeight="bold">Select Test Cases:</Text>
            {testCases && 
              // Type assertion to access items property
              (testCases as unknown as PaginatedItems<TestCase>).items.map((testCase: TestCase) => (
                <Checkbox
                  key={testCase.id}
                  isChecked={selectedTestCases.includes(testCase.id)}
                  onChange={() => handleTestCaseSelection(testCase.id)}
                  mb={2}
                >
                  {testCase.title}
                </Checkbox>
              ))}
          </Box>

          <Button type="submit" colorScheme="blue">
            Create Test Run
          </Button>
        </form>
      </VStack>
    </Box>
  );
};

export default CreateTestRun;
