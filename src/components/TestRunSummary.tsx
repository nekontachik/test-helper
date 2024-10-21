import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { Pie } from 'react-chartjs-2';
import { TestRun, TestCaseResultStatus } from '@/types';

interface TestRunSummaryProps {
  testRun: TestRun;
}

export const TestRunSummary: React.FC<TestRunSummaryProps> = ({ testRun }) => {
  const testCaseResults = testRun.testCaseResults || [];

  const passedCount = testCaseResults.filter(
    (r) => r.status === TestCaseResultStatus.PASSED
  ).length;
  const failedCount = testCaseResults.filter(
    (r) => r.status === TestCaseResultStatus.FAILED
  ).length;
  const skippedCount = testCaseResults.filter(
    (r) => r.status === TestCaseResultStatus.SKIPPED
  ).length;

  const data = {
    labels: ['Passed', 'Failed', 'Skipped'],
    datasets: [
      {
        data: [passedCount, failedCount, skippedCount],
        backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
      },
    ],
  };

  return (
    <Box>
      <Heading as="h2" size="xl" mb={4}>
        Test Run Summary: {testRun.name}
      </Heading>
      <VStack align="stretch" spacing={4}>
        <Text>Total Test Cases: {testCaseResults.length}</Text>
        <Text>Passed: {passedCount}</Text>
        <Text>Failed: {failedCount}</Text>
        <Text>Skipped: {skippedCount}</Text>
        <Box height="300px">
          <Pie
            data={data}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </Box>
      </VStack>
    </Box>
  );
};
