import React from 'react';
import { Box, Text, Badge } from '@chakra-ui/react';
import { TestRun } from '@/types';

interface TestRunItemProps {
  testRun: TestRun;
}

const TestRunItem: React.FC<TestRunItemProps> = ({ testRun }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
      <Text fontSize="xl" fontWeight="bold">
        {testRun.name}
      </Text>
      <Badge colorScheme={getStatusColor(testRun.status)}>
        {testRun.status}
      </Badge>
      <Text mt={2}>
        Created: {new Date(testRun.createdAt).toLocaleDateString()}
      </Text>
    </Box>
  );
};

function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'IN_PROGRESS':
      return 'blue';
    case 'COMPLETED':
      return 'green';
    default:
      return 'gray';
  }
}

export default TestRunItem;
