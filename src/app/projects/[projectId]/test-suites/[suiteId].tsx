import React from 'react';
import { useParams } from 'next/navigation';
import { useTestSuite } from '@/hooks/useTestSuite';
import { TestSuiteDetails } from '@/components/TestSuiteDetails';
import { Spinner, Box, Text } from '@chakra-ui/react';

export default function TestSuitePage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const suiteId = params?.suiteId as string;

  const {
    data: testSuite,
    isLoading,
    error,
  } = useTestSuite(projectId, suiteId);

  if (!projectId || !suiteId) return <Text>Invalid project or suite ID</Text>;
  if (isLoading) return <Spinner />;
  if (error) return <Box>Error: {error.message}</Box>;
  if (!testSuite) return <Text>Test suite not found</Text>;

  return <TestSuiteDetails testSuite={testSuite} />;
}
