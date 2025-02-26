import { useQuery } from '@tanstack/react-query';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import apiClient from '@/lib/apiClient';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface TestCaseDetailProps {
  projectId: string;
  testCaseId: string;
}

export function TestCaseDetail({ projectId, testCaseId }: TestCaseDetailProps): React.ReactElement {
  const {
    data: testCase,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['testCase', projectId, testCaseId],
    queryFn: () => apiClient.getTestCase(projectId, testCaseId),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={(error as Error).message} />;

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {testCase?.title}
      </Heading>
      <VStack align="start" spacing={4}>
        <Text>
          <strong>Description:</strong> {testCase?.description}
        </Text>
        <Text>
          <strong>Status:</strong> {testCase?.status}
        </Text>
        <Text>
          <strong>Priority:</strong> {testCase?.priority}
        </Text>
      </VStack>
    </Box>
  );
}
