import React from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Flex,
  Button,
} from '@chakra-ui/react';
import type { TestCase} from '@/types';
import { TestCaseStatus, TestCasePriority } from '@/types';
import Link from 'next/link';

interface TestCaseCardProps {
  testCase: TestCase;
  projectId: string;
}

export function TestCaseCard({ testCase, projectId }: TestCaseCardProps): JSX.Element {
  return (
    <Box borderWidth="1px" borderRadius="lg" p={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md">
          <Link href={`/projects/${projectId}/test-cases/${testCase.id}`}>
            {testCase.title}
          </Link>
        </Heading>
        <Flex>
          <Badge colorScheme={testCase.status === TestCaseStatus.ACTIVE ? 'green' : 'red'} mr={2}>
            {testCase.status}
          </Badge>
          <Badge colorScheme={testCase.priority === TestCasePriority.HIGH ? 'red' : testCase.priority === TestCasePriority.MEDIUM ? 'yellow' : 'blue'}>
            {testCase.priority}
          </Badge>
        </Flex>
      </Flex>
      <Text mt={2} noOfLines={2}>
        {testCase.description}
      </Text>
      <Flex mt={4} justifyContent="flex-end">
        <Button as={Link} href={`/projects/${projectId}/test-cases/${testCase.id}/edit`} size="sm" colorScheme="blue" mr={2}>
          Edit
        </Button>
        <Button as={Link} href={`/projects/${projectId}/test-cases/${testCase.id}`} size="sm" variant="outline">
          View Details
        </Button>
      </Flex>
    </Box>
  );
}
