import React from 'react';
import { Box, Text, VStack, Spinner } from '@chakra-ui/react';
import { useTestCases } from '@/hooks/useTestCases';
import type { TestCase } from '@prisma/client';

interface TestCaseListProps {
  projectId: string;
}

export const TestCaseList: React.FC<TestCaseListProps> = ({ projectId }) => {
  const { data: testCases, isLoading, error } = useTestCases(projectId);

  if (isLoading) return <Spinner />;
  if (error) return <Text color="red.500">Error loading test cases</Text>;
  if (!testCases?.length) return <Text>No test cases found</Text>;

  return (
    <VStack spacing={4} align="stretch">
      {testCases.map((testCase: TestCase) => (
        <Box key={testCase.id} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">{testCase.title}</Text>
          {testCase.description && <Text>{testCase.description}</Text>}
        </Box>
      ))}
    </VStack>
  );
};
