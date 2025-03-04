'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Heading, Button, Flex, Card, CardBody, CardHeader, Text, Divider } from '@chakra-ui/react';
import { TestRunItem } from './TestRunItem';
import { TestRunsSkeleton } from './Skeletons';
import type { TestRun } from '@/types/testRuns';

interface TestRunsSectionProps {
  testRuns: TestRun[] | null;
  isLoading: boolean;
  error: Error | null;
  viewAllTestRunsUrl: string;
  borderColor: string;
}

export function TestRunsSection({
  testRuns,
  isLoading,
  error,
  viewAllTestRunsUrl,
  borderColor
}: TestRunsSectionProps): JSX.Element {
  if (isLoading) {
    return <TestRunsSkeleton />;
  }

  return (
    <Box mb={8}>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md">Recent Test Runs</Heading>
        <Link href={viewAllTestRunsUrl} passHref>
          <Button 
            size="sm" 
            variant="outline"
          >
            View All
          </Button>
        </Link>
      </Flex>

      <Card borderWidth="1px" borderColor={borderColor}>
        <CardHeader pb={0}>
          <Heading size="sm">Test Run Status</Heading>
        </CardHeader>
        <CardBody>
          {error ? (
            <Text color="red.500">Error loading test runs: {error.message}</Text>
          ) : testRuns && testRuns.length > 0 ? (
            <>
              {testRuns.slice(0, 3).map((run, index) => (
                <React.Fragment key={run.id}>
                  <TestRunItem
                    id={run.id}
                    name={run.name}
                    status={run.status}
                    progress={run.progress || 0}
                    date={run.createdAt || new Date().toISOString()}
                  />
                  {index < testRuns.length - 1 && index < 2 && <Divider my={2} />}
                </React.Fragment>
              ))}
            </>
          ) : (
            <Text>No test runs found. Start a new test run to see results here.</Text>
          )}
        </CardBody>
      </Card>
    </Box>
  );
} 