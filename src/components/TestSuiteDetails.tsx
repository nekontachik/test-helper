import React from 'react';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import type { TestSuite } from '@/types';
import NextLink from 'next/link';
import { useTestCases } from '@/hooks/useTestCases';
import { Loading } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface TestSuiteDetailsProps {
  testSuite: TestSuite;
}

export const TestSuiteDetails = ({
  testSuite,
}: TestSuiteDetailsProps): React.ReactElement => {
  logger.debug('TestSuiteDetails Component Mounted', { testSuiteId: testSuite.id });

  const {
    testCases: testCasesResponse,
    isLoading,
    error,
  } = useTestCases({
    projectId: testSuite.projectId,
    initialFilters: {
      page: 1,
      limit: 100
    }
  });

  if (isLoading) {
    return <Loading text="Loading test cases..." size="lg" />;
  }

  if (error) {
    return (
      <Text color="red.500">Error loading test cases: {error.message}</Text>
    );
  }

  const testCases = testCasesResponse ?? [];
  const testCasesForSuite = testCases.filter(
    (tc: { id: string }) => testSuite.testCases?.includes(tc.id) ?? false
  );

  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        {testSuite.name}
      </Heading>
      <Text mb={4}>{testSuite.description}</Text>
      <Heading as="h3" size="lg" mb={2}>
        Test Cases
      </Heading>
      <Text mb={2}>Total Test Cases: {testCasesForSuite.length}</Text>
      {testCasesForSuite.length > 0 ? (
        <VStack align="stretch" spacing={4}>
          {testCasesForSuite.map((testCase: { 
            id: string; 
            title: string; 
            priority?: string; 
            status: string 
          }) => (
            <Box key={testCase.id} p={4} borderWidth={1} borderRadius="md">
              <Heading as="h4" size="md">
                {testCase.title}
              </Heading>
              {testCase.priority && <Text>Priority: {testCase.priority}</Text>}
              <Text>Status: {testCase.status}</Text>
              <NextLink
                href={`/projects/${testSuite.projectId}/test-cases/${testCase.id}`}
                passHref
                legacyBehavior
              >
                <Button as="a" mt={2}>
                  View Details
                </Button>
              </NextLink>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text>No test cases in this suite</Text>
      )}
    </Box>
  );
};
