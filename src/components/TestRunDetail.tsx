import { useQuery } from '@tanstack/react-query';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import apiClient from '@/lib/apiClient'; // Updated import statement
import { TestRun } from '@/types';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface TestRunDetailProps {
  projectId: string;
  testRunId: string;
}

export function TestRunDetail({ projectId, testRunId }: TestRunDetailProps) {
  const {
    data: testRun,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['testRun', projectId, testRunId],
    queryFn: () => apiClient.getTestRun(projectId, testRunId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {testRun?.name}
      </Heading>
      <VStack align="start" spacing={4}>
        <Text>
          <strong>Status:</strong> {testRun?.status}
        </Text>
        <Text>
          <strong>Created At:</strong>{' '}
          {new Date(testRun?.createdAt || '').toLocaleString()}
        </Text>
        <Text>
          <strong>Updated At:</strong>{' '}
          {new Date(testRun?.updatedAt || '').toLocaleString()}
        </Text>
      </VStack>
    </Box>
  );
}
