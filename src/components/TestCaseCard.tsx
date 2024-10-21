import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  VStack,
  Flex,
} from '@chakra-ui/react';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';

interface TestCaseCardProps {
  testCase: TestCase;
}

export function TestCaseCard({ testCase }: TestCaseCardProps) {
  return (
    <Box borderWidth={1} borderRadius="md" p={4}>
      <VStack align="start" spacing={2}>
        <Heading as="h3" size="md">
          {testCase.title}
        </Heading>
        <Text>{testCase.description}</Text>
        <Flex>
          <Badge colorScheme={testCase.status === TestCaseStatus.ACTIVE ? 'green' : 'red'} mr={2}>
            {testCase.status}
          </Badge>
          <Badge colorScheme={
            testCase.priority === TestCasePriority.HIGH ? 'red' : 
            testCase.priority === TestCasePriority.MEDIUM ? 'yellow' : 'green'
          }>
            {testCase.priority}
          </Badge>
        </Flex>
      </VStack>
    </Box>
  );
}
