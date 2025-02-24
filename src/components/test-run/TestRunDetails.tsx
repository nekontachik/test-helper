'use client';

import { Box, Card, CardBody, Grid, Text, Badge } from '@chakra-ui/react';
import { TestRun, TestCaseResultStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';

interface TestRunDetailsProps {
  testRun: TestRun;
}

export function TestRunDetails({ testRun }: TestRunDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case TestCaseResultStatus.PASSED:
        return 'green';
      case TestCaseResultStatus.FAILED:
        return 'red';
      case TestCaseResultStatus.SKIPPED:
        return 'orange';
      default:
        return 'gray';
    }
  };

  return (
    <Card>
      <CardBody>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <Box>
            <Text fontWeight="bold">Name</Text>
            <Text>{testRun.name}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Status</Text>
            <Badge colorScheme={getStatusColor(testRun.status)}>{testRun.status}</Badge>
          </Box>
          <Box>
            <Text fontWeight="bold">Created At</Text>
            <Text>{formatDate(testRun.createdAt)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Updated At</Text>
            <Text>{formatDate(testRun.updatedAt)}</Text>
          </Box>
          <Box>
            <Text fontWeight="bold">Total Test Cases</Text>
            <Text>{testRun.testCases?.length ?? 0}</Text>
          </Box>
        </Grid>
      </CardBody>
    </Card>
  );
} 