import React from 'react';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';
import { TestSuite, TestCase } from '@/types';
import { useRouter } from 'next/navigation';
import { useTestCases } from '@/hooks/useTestCases';
import NextLink from 'next/link';

interface TestSuiteDetailsProps {
  testSuite: TestSuite;
}

export const TestSuiteDetails: React.FC<TestSuiteDetailsProps> = ({
  testSuite,
}) => {
  const router = useRouter();
  const {
    data: testCasesResponse,
    isLoading,
    error,
  } = useTestCases(testSuite.projectId);

  if (isLoading) {
    return <Text>Loading test cases...</Text>;
  }

  if (error) {
    return (
      <Text color="red.500">Error loading test cases: {error.message}</Text>
    );
  }

  const testCases = testCasesResponse?.data || [];
  // Assuming testSuite.testCases is an array of test case IDs
  const testCasesForSuite = testCases.filter(
    (tc: TestCase) => testSuite.testCases?.includes(tc.id)
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
          {testCasesForSuite.map((testCase: TestCase) => (
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
}
