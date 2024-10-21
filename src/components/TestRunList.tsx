import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Flex, Select } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import  apiClient  from '@/lib/apiClient';
import { TestRun, TestRunStatus } from '@/types';
import { TestRunCard } from '@/components/TestRunCard';

interface TestRunListProps {
  projectId: string;
}

export default function TestRunList({ projectId }: TestRunListProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt:desc');
  const [filter, setFilter] = useState('');
  const limit = 10;

  const {
    data: testRunsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['testRuns', projectId, page, sort, filter],
    queryFn: () => apiClient.getTestRuns(projectId, { page, limit, sort, filter }),
  });

  if (isLoading) return <Text>Loading test runs...</Text>;
  if (error) return <Text color="red.500">Error loading test runs: {(error as Error).message}</Text>;

  const testRuns = testRunsResponse?.data || [];
  const totalPages = testRunsResponse?.totalPages || 1;

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        Test Runs
      </Heading>
      <Flex gap={4} mb={4}>
        <Select
          value={sort}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}
          width="auto"
        >
          <option value="createdAt:desc">Newest First</option>
          <option value="createdAt:asc">Oldest First</option>
          <option value="name:asc">Name A-Z</option>
          <option value="name:desc">Name Z-A</option>
        </Select>
        <Select
          value={filter}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
          width="auto"
        >
          <option value="">All Statuses</option>
          {Object.values(TestRunStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </Flex>
      <VStack spacing={4} align="stretch">
        {testRuns.length > 0 ? (
          testRuns.map((testRun: TestRun) => (
            <TestRunCard key={testRun.id} testRun={testRun} />
          ))
        ) : (
          <Text>No test runs found for this project.</Text>
        )}
      </VStack>
      <Flex justifyContent="space-between" mt={4}>
        <Button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          isDisabled={page === 1}
        >
          Previous
        </Button>
        <Text>
          Page {page} of {totalPages}
        </Text>
        <Button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          isDisabled={page === totalPages}
        >
          Next
        </Button>
      </Flex>
      <Button
        mt={4}
        colorScheme="blue"
        onClick={() => router.push(`/projects/${projectId}/test-runs/create`)}
      >
        Create New Test Run
      </Button>
    </Box>
  );
}
