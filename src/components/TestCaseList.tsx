import React, { useState } from 'react';
import { Box, VStack, Heading, Text, Button, Flex, Select } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/hooks';
import { useToast } from '@chakra-ui/toast';
import { useTestCases } from '@/hooks/useTestCases';
import { TestCase, TestCaseStatus, TestCasePriority, TestCaseFormData } from '@/types';
import { Pagination } from '@/components/Pagination';
import { TestCaseCard } from '@/components/TestCaseCard';
import { CreateTestCaseModal } from '@/components/CreateTestCaseModal';
import ErrorBoundary from '@/components/ErrorBoundary';

interface TestCaseListProps {
  projectId: string;
}

export function TestCaseList({ projectId }: TestCaseListProps) {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [status, setStatus] = useState<TestCaseStatus | ''>('');
  const [priority, setPriority] = useState<TestCasePriority | ''>('');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading, error, createTestCase } = useTestCases(projectId, {
    page,
    limit,
    status: status || undefined,
    priority: priority || undefined,
  });

  const handleCreateTestCase = async (formData: TestCaseFormData) => {
    try {
      await createTestCase(formData);
      toast({
        title: 'Test case created',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error creating test case',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as TestCaseStatus | '');
    setPage(1);
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPriority(e.target.value as TestCasePriority | '');
    setPage(1);
  };

  if (isLoading) return <Text>Loading test cases...</Text>;
  if (error) return <Text color="red.500">Error loading test cases: {error.message}</Text>;

  return (
    <ErrorBoundary>
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading size="lg">Test Cases</Heading>
          <Button onClick={onOpen} colorScheme="blue">
            Create Test Case
          </Button>
        </Flex>

        <Flex mb={4}>
          <Select mr={2} value={status} onChange={handleStatusChange}>
            <option value="">All Statuses</option>
            {Object.values(TestCaseStatus).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={priority} onChange={handlePriorityChange}>
            <option value="">All Priorities</option>
            {Object.values(TestCasePriority).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </Flex>

        <VStack spacing={4} align="stretch">
          {data?.items.map((testCase: TestCase) => (
            <TestCaseCard key={testCase.id} testCase={testCase} projectId={projectId} />
          ))}
        </VStack>

        {data && (
          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
          />
        )}

        <CreateTestCaseModal
          isOpen={isOpen}
          onClose={onClose}
          onCreateTestCase={handleCreateTestCase}
          projectId={projectId}
        />
      </Box>
    </ErrorBoundary>
  );
}
