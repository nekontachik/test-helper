import React from 'react';
import { Box, Heading, Text, VStack, Button, Flex } from '@chakra-ui/react';
import type { TestSuite } from '../models/types';
import NextLink from 'next/link';

interface TestSuiteListProps {
  projectId: string;
  testSuites: TestSuite[];
}

export const TestSuiteList: React.FC<TestSuiteListProps> = ({
  projectId,
  testSuites,
}) => {
  return (
    <VStack spacing={4} align="stretch">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading as="h2" size="lg">
          Test Suites
        </Heading>
        <NextLink
          href={`/projects/${projectId}/test-suites/new`}
          passHref
          legacyBehavior
        >
          <Button as="a" colorScheme="blue">
            Create New Test Suite
          </Button>
        </NextLink>
      </Flex>
      {testSuites.length === 0 ? (
        <Text>No test suites found.</Text>
      ) : (
        testSuites.map((suite) => (
          <Box key={suite.id} borderWidth="1px" borderRadius="lg" p={4}>
            <Heading as="h3" size="md">
              {suite.name}
            </Heading>
            <Text mt={2}>{suite.description}</Text>
            <Text mt={2}>
              Number of Test Cases: {suite.testCases?.length ?? 0}
            </Text>
            <NextLink
              href={`/projects/${projectId}/test-suites/${suite.id}`}
              passHref
              legacyBehavior
            >
              <Button as="a" mt={2} colorScheme="teal" size="sm">
                View Details
              </Button>
            </NextLink>
          </Box>
        ))
      )}
    </VStack>
  );
};
