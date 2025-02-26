'use client';

import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Badge, 
  Table, 
  Thead, 
  Tbody, 
  Tr, 
  Th, 
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Progress
} from '@chakra-ui/react';
import type { TestRun } from '@/types';
import { TestRunStatus, TestCaseResultStatus } from '@/types';
import { formatDate } from '@/lib/utils/date';

interface TestRunDetailProps {
  testRun: TestRun & {
    results?: Array<{
      id: string;
      status: TestCaseResultStatus;
      notes?: string;
      testCase?: {
        title: string;
      };
    }>;
    completedAt?: string;
  };
}

export function TestRunDetail({ testRun }: TestRunDetailProps): React.ReactElement {
  const passedCount = testRun.results?.filter(
    (result) => result.status === TestCaseResultStatus.PASSED
  ).length || 0;
  
  const failedCount = testRun.results?.filter(
    (result) => result.status === TestCaseResultStatus.FAILED
  ).length || 0;
  
  const skippedCount = testRun.results?.filter(
    (result) => result.status === TestCaseResultStatus.SKIPPED
  ).length || 0;
  
  const totalCount = testRun.results?.length || 0;
  const passRate = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;
  
  const getStatusColor = (status: TestRunStatus): string => {
    switch (status) {
      case TestRunStatus.COMPLETED:
        return 'green';
      case TestRunStatus.IN_PROGRESS:
        return 'blue';
      case TestRunStatus.PENDING:
        return 'yellow';
      default:
        return 'gray';
    }
  };
  
  const getResultStatusColor = (status: TestCaseResultStatus): string => {
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

  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Heading as="h2" size="xl">
            {testRun.name}
          </Heading>
          <Badge colorScheme={getStatusColor(testRun.status as TestRunStatus)} fontSize="md" px={3} py={1}>
            {testRun.status}
          </Badge>
        </HStack>
        
        <StatGroup>
          <Stat>
            <StatLabel>Created</StatLabel>
            <StatNumber>{formatDate(testRun.createdAt)}</StatNumber>
          </Stat>
          {testRun.completedAt && (
            <Stat>
              <StatLabel>Completed</StatLabel>
              <StatNumber>{formatDate(testRun.completedAt)}</StatNumber>
            </Stat>
          )}
          <Stat>
            <StatLabel>Test Cases</StatLabel>
            <StatNumber>{totalCount}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Pass Rate</StatLabel>
            <StatNumber>{passRate.toFixed(0)}%</StatNumber>
          </Stat>
        </StatGroup>
        
        <Box>
          <Text fontWeight="bold" mb={2}>Progress</Text>
          <Progress 
            value={passRate} 
            colorScheme={passRate > 80 ? 'green' : passRate > 50 ? 'yellow' : 'red'} 
            size="md" 
            borderRadius="md"
          />
        </Box>
        
        <Box>
          <Heading as="h3" size="md" mb={4}>
            Results
          </Heading>
          <HStack mb={4} spacing={4}>
            <Badge colorScheme="green" px={2} py={1}>Passed: {passedCount}</Badge>
            <Badge colorScheme="red" px={2} py={1}>Failed: {failedCount}</Badge>
            <Badge colorScheme="yellow" px={2} py={1}>Skipped: {skippedCount}</Badge>
          </HStack>
          
          {testRun.results && testRun.results.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Test Case</Th>
                  <Th>Status</Th>
                  <Th>Notes</Th>
                </Tr>
              </Thead>
              <Tbody>
                {testRun.results.map((result) => (
                  <Tr key={result.id}>
                    <Td>{result.testCase?.title || 'Unknown Test Case'}</Td>
                    <Td>
                      <Badge colorScheme={getResultStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                    </Td>
                    <Td>{result.notes || '-'}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          ) : (
            <Text>No results available</Text>
          )}
        </Box>
      </VStack>
    </Box>
  );
} 