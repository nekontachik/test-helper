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
} from '@chakra-ui/react';
import { Checkbox } from '@chakra-ui/checkbox';
import { useTestCases } from '@/hooks/useTestCases';
import { useCreateTestRun } from '@/hooks/useTestRuns';
import { TestCase, TestRunFormData } from '@/types';

const CreateTestRun: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TestRunFormData>();
  const { data: testCases, isLoading, error } = useTestCases(projectId);
  const createTestRun = useCreateTestRun(projectId);
  const [selectedTestCases, setSelectedTestCases] = useState<string[]>([]);

  if (isLoading) return <div>Loading test cases...</div>;
  if (error) return <div>Error loading test cases: {error.message}</div>;

  const onSubmit = async (data: TestRunFormData) => {
    try {
      await createTestRun.mutateAsync({
        name: data.name,
        testCases: selectedTestCases
          .map((id) => {
            const testCase = testCases?.data.find(
              (tc: TestCase) => tc.id === id
            );
            return testCase ? { ...testCase } : null;
          })
          .filter((tc): tc is TestCase => tc !== null),
      });
      router.push(`/projects/${projectId}/test-runs`);
    } catch (error) {
      console.error('Error creating test run:', error);
    }
  };

  const handleTestCaseSelection = (testCaseId: string) => {
    setSelectedTestCases((prev) =>
      prev.includes(testCaseId)
        ? prev.filter((id) => id !== testCaseId)
        : [...prev, testCaseId]
    );
  };

  const formattedTestCases = useMemo(
    () =>
      testCases.data.map((tc: TestCase) => ({
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
      })),
    [testCases.data]
  );

  return (
    <Box maxWidth="600px" margin="auto" padding={4}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.name}>
            <FormLabel htmlFor="name">Test Run Name</FormLabel>
            <Input
              id="name"
              {...register('name', { required: 'Test run name is required' })}
            />
            {errors.name && <Text color="red.500">{errors.name.message}</Text>}
          </FormControl>

          <Text fontWeight="bold">Select Test Cases:</Text>
          {testCases &&
            testCases.data.map((testCase: TestCase) => (
              <Checkbox
                key={testCase.id}
                isChecked={selectedTestCases.includes(testCase.id)}
                onChange={() => handleTestCaseSelection(testCase.id)}
              >
                {testCase.title}
              </Checkbox>
            ))}

          <Button
            type="submit"
            colorScheme="blue"
            isLoading={createTestRun.isPending}
          >
            Create Test Run
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default CreateTestRun;
