import React, { useState } from 'react';
import { Box, Text, VStack, Spinner, Button, Flex } from '@chakra-ui/react';
import { useTestCases } from '@/hooks/useTestCases';

interface TestCaseListProps {
  projectId: string;
}

interface TestCaseItem {
  id: string;
  title: string;
  description?: string;
}

const TestCaseList: React.FC<TestCaseListProps> = ({ projectId }): React.ReactElement => {
  const [page, setPage] = useState(1);
  const { testCases, totalPages, isLoading, error } = useTestCases({
    projectId,
    initialFilters: {
      page,
      limit: 10
    }
  });

  if (isLoading) return <Spinner size="sm" />;
  if (error)
    return (
      <Text color="red.500">Error loading test cases: {error.message}</Text>
    );
  if (!testCases || testCases.length === 0) return <Text>No test cases found.</Text>;

  return (
    <VStack align="stretch" spacing={4}>
      {testCases.map((testCase: TestCaseItem) => (
        <Box key={testCase.id} p={4} borderWidth={1} borderRadius="md">
          <Text fontWeight="bold">{testCase.title}</Text>
          <Text>{testCase.description}</Text>
        </Box>
      ))}
      <Flex justifyContent="space-between" mt={4}>
        <Button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Text>
          Page {page} of {totalPages}
        </Text>
        <Button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </Flex>
    </VStack>
  );
};

export default TestCaseList;
