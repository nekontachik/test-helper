import React from 'react';
import { Box, Heading, Text, VStack, Badge } from '@chakra-ui/react';
import type { TestRun, TestCaseResult} from '@/types';
import { TestCaseResultStatus } from '@/types';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export const TestRunDetails: React.FC<TestRunDetailsProps> = ({ testRun }) => {
  const getStatusColor = (status: TestCaseResultStatus): string => {
    switch (status) {
      case TestCaseResultStatus.PASSED:
        return 'green';
      case TestCaseResultStatus.FAILED:
        return 'red';
      case TestCaseResultStatus.SKIPPED:
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const testCaseResults = testRun.testCaseResults || [];

  const passedTests = testCaseResults.filter(
    (tcr) => tcr.status === TestCaseResultStatus.PASSED
  ).length;
  const failedTests = testCaseResults.filter(
    (tcr) => tcr.status === TestCaseResultStatus.FAILED
  ).length;
  const skippedTests = testCaseResults.filter(
    (tcr) => tcr.status === TestCaseResultStatus.SKIPPED
  ).length;

  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        {testRun.name}
      </Heading>
      <Text mb={2}>Status: {testRun.status}</Text>
      <Text mb={4}>
        Passed: {passedTests} | Failed: {failedTests} | Skipped: {skippedTests}
      </Text>
      <VStack align="stretch" spacing={4}>
        {testCaseResults.map((testCaseResult: TestCaseResult) => (
          <Box key={testCaseResult.id} p={4} borderWidth={1} borderRadius="md">
            <Heading as="h3" size="md" mb={2}>
              {testCaseResult.testCaseId}
            </Heading>
            <Badge colorScheme={getStatusColor(testCaseResult.status as TestCaseResultStatus)}>
              {testCaseResult.status}
            </Badge>
            <Text mt={2}>
              {testCaseResult.notes || 'No notes available'}
            </Text>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};
