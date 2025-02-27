import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  Flex,
} from '@chakra-ui/react';
import { useTestReports } from '@/hooks/useTestReports';
import type { TestReport } from '@/types';
import Link from 'next/link';

interface TestReportListProps {
  projectId: string;
}

export default function TestReportList({ projectId }: TestReportListProps): JSX.Element {
  const { data: testReports, isLoading, error } = useTestReports(projectId);

  if (isLoading) {
    return <Spinner size="xl" />;
  }

  if (error) {
    return <Text color="red.500">Error: Unable to load test reports.</Text>;
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Heading as="h2" size="lg">
          Test Reports
        </Heading>
        <Button
          as={Link}
          href={`/projects/${projectId}/test-reports/new`}
          colorScheme="blue"
        >
          Generate Report
        </Button>
      </Flex>

      {testReports && testReports.length > 0 ? (
        <VStack spacing={4} align="stretch">
          {testReports.map((testReport: TestReport) => (
            <Box key={testReport.id} p={3} borderWidth={1} borderRadius="md">
              <Heading size="md">{testReport.name}</Heading>
              <Text>
                Created: {new Date(testReport.createdAt).toLocaleDateString()}
              </Text>
              <Button
                as={Link}
                href={`/projects/${projectId}/test-reports/${testReport.id}`}
                size="sm"
                mt={2}
              >
                View Report
              </Button>
            </Box>
          ))}
        </VStack>
      ) : (
        <Box textAlign="center" mt={10} p={6} borderWidth={1} borderRadius="md">
          <Text fontSize="xl" mb={4}>
            No test reports found
          </Text>
          <Text mb={6}>Generate your first test report to get started!</Text>
          <Button
            as={Link}
            href={`/projects/${projectId}/test-reports/new`}
            colorScheme="blue"
          >
            Generate Report
          </Button>
        </Box>
      )}
    </Box>
  );
}
