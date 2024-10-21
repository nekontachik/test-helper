import React from 'react';
import { Box, Text, VStack, Spinner } from '@chakra-ui/react';
import { TestRun } from '@/types';

export interface TestRunListProps {
  data: TestRun[];
  onTestRunClick: (testRun: TestRun) => void;
  isLoading?: boolean;
}

export const TestRunList: React.FC<TestRunListProps> = ({
  data,
  onTestRunClick,
  isLoading = false,
}) => {
  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (data.length === 0) {
    return <Text>No test runs found.</Text>;
  }

  return (
    <VStack spacing={4} align="stretch">
      {data.map((testRun) => (
        <Box
          key={testRun.id}
          p={4}
          borderWidth={1}
          borderRadius="md"
          onClick={() => onTestRunClick(testRun)}
          cursor="pointer"
        >
          <Text fontWeight="bold">{testRun.name}</Text>
          <Text>Status: {testRun.status}</Text>
          <Text>
            Created: {new Date(testRun.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      ))}
    </VStack>
  );
};
