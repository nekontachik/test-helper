import React from 'react';
import { Box, Heading, Text, Badge, VStack } from '@chakra-ui/react';
import type { TestRun} from '@/types';
import { TestRunStatus } from '@/types';

interface TestRunCardProps {
  testRun: TestRun;
}

export function TestRunCard({ testRun }: TestRunCardProps): JSX.Element {
  const getStatusColor = (status: TestRunStatus): string => {
    switch (status) {
      case TestRunStatus.PENDING:
        return 'yellow';
      case TestRunStatus.IN_PROGRESS:
        return 'blue';
      case TestRunStatus.COMPLETED:
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Box borderWidth={1} borderRadius="md" p={4}>
      <VStack align="start" spacing={2}>
        <Heading as="h3" size="md">
          {testRun.name}
        </Heading>
        <Badge colorScheme={getStatusColor(testRun.status as TestRunStatus)}>
          {testRun.status}
        </Badge>
        <Text>Created: {new Date(testRun.createdAt).toLocaleString()}</Text>
      </VStack>
    </Box>
  );
}
