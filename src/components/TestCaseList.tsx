import React, { useState, useRef, useEffect } from 'react';
import { Box, VStack, Heading, Text, Button, Flex, Select, Input } from '@chakra-ui/react';
import { TestCase, TestCaseStatus, TestCasePriority } from '@/types';
import { useTestCases } from '@/hooks/useTestCases';
import { Pagination } from '@/components/Pagination';
import { Skeleton } from '@/components/Skeleton';
import Link from 'next/link';

interface TestCaseListProps {
  projectId: string;
}

export function TestCaseList({ projectId }: TestCaseListProps) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<TestCaseStatus | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<TestCasePriority | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useTestCases(projectId, page, {
    status: statusFilter,
    priority: priorityFilter,
    search: searchQuery,
  });

  const testCaseRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const currentIndex = testCaseRefs.current.findIndex(ref => ref === document.activeElement);
        const nextIndex = e.key === 'ArrowDown' 
          ? (currentIndex + 1) % testCaseRefs.current.length
          : (currentIndex - 1 + testCaseRefs.current.length) % testCaseRefs.current.length;
        testCaseRefs.current[nextIndex]?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="60px" />
        <Skeleton height="100px" />
        <Skeleton height="100px" />
        <Skeleton height="100px" />
      </VStack>
    );
  }

  if (error) return <Text>Error loading test cases: {error.message}</Text>;

  const testCases = data?.items || [];
  const totalPages = data?.totalPages || 1;

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="lg">Test Cases</Heading>
        <Link href={`/projects/${projectId}/test-cases/create`} passHref>
          <Button as="a" colorScheme="green">Create Test Case</Button>
        </Link>
      </Flex>
      <Flex mb={4}>
        <Select
          placeholder="Filter by Status"
          value={statusFilter || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as TestCaseStatus | null)}
          mr={2}
        >
          <option value="">All</option>
          {Object.values(TestCaseStatus).map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </Select>
        <Select
          placeholder="Filter by Priority"
          value={priorityFilter || ''}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriorityFilter(e.target.value as TestCasePriority | null)}
          mr={2}
        >
          <option value="">All</option>
          {Object.values(TestCasePriority).map((priority) => (
            <option key={priority} value={priority}>{priority}</option>
          ))}
        </Select>
        <Input
          placeholder="Search test cases"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        />
      </Flex>
      <VStack spacing={4} align="stretch">
        {testCases.map((testCase: TestCase, index: number) => (
          <Box 
            key={testCase.id} 
            p={4} 
            borderWidth={1} 
            borderRadius="md" 
            borderColor="gray.200"
            bg="white"
            tabIndex={0}
            ref={(el: HTMLDivElement | null) => testCaseRefs.current[index] = el}
            _focus={{ boxShadow: 'outline' }}
          >
            <Flex justify="space-between" align="center">
              <Box>
                <Heading size="md">{testCase.title}</Heading>
                <Text mt={2}>{testCase.description}</Text>
                <Flex mt={2}>
                  <Text mr={2}>Status: {testCase.status}</Text>
                  <Text>Priority: {testCase.priority}</Text>
                </Flex>
              </Box>
              <Link href={`/projects/${projectId}/test-cases/${testCase.id}`} passHref>
                <Button as="a" size="sm" colorScheme="blue">View Details</Button>
              </Link>
            </Flex>
          </Box>
        ))}
      </VStack>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(newPage: number) => setPage(newPage)}
      />
    </Box>
  );
}
