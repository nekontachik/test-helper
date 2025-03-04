import React from 'react';
import { Box, Heading, Text, VStack, Button, Flex } from '@chakra-ui/react';
import type { Project, TestRun } from '@/types';
import Link from 'next/link';
import { TestRunList } from './TestRunList';
import { useTestRuns } from '@/hooks/testRuns';

interface ProjectDetailsProps {
  project: Project;
}

export default function ProjectDetails({ project }: ProjectDetailsProps): React.ReactElement {
  const { data: testRuns, isLoading, error } = useTestRuns(project.id);

  const handleTestRunClick = (testRun: TestRun): void => {
    // Handle test run click, e.g., navigate to test run details
    console.log('Clicked test run:', testRun);
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6}>
      <VStack align="start" spacing={4}>
        <Heading as="h2" size="xl">
          {project.name}
        </Heading>
        <Text>{project.description}</Text>
        <Text>Created: {formatDate(project.createdAt)}</Text>
        <Text>Last Updated: {formatDate(project.updatedAt)}</Text>

        <Flex mt={4} justifyContent="space-between" width="100%">
          <Link href={`/projects/${project.id}/test-cases`} passHref>
            <Button as="a" colorScheme="blue">
              View Test Cases
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/test-runs/new`} passHref>
            <Button as="a" colorScheme="green">
              Create Test Run
            </Button>
          </Link>
          <Link href={`/projects/${project.id}/edit`} passHref>
            <Button as="a" colorScheme="yellow">
              Edit Project
            </Button>
          </Link>
        </Flex>

        <Box width="100%">
          <Heading as="h3" size="lg" mb={4}>
            Test Runs
          </Heading>
          {isLoading ? (
            <Text>Loading test runs...</Text>
          ) : error ? (
            <Text color="red.500">
              Error loading test runs: {error.message}
            </Text>
          ) : (
            <TestRunList
              data={testRuns?.data || []}
              onTestRunClick={handleTestRunClick}
            />
          )}
        </Box>
      </VStack>
    </Box>
  );
}
