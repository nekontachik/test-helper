import { useCallback, useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  Spinner,
  Input,
  Select,
  HStack,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { usePermissions } from '@/hooks/usePermissions';
import { Action, Resource } from '@/lib/auth/rbac/types';
import type { TestCase, CreateTestCase } from '@/lib/validations/testCase';
import { TestCaseForm, TestCaseCard } from '.';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { FiPlus } from 'react-icons/fi';

interface TestCaseListProps {
  projectId: string;
}

const MotionStack = motion(Stack);
const MotionBox = motion(Box);

export function TestCaseList({ projectId }: TestCaseListProps) {
  const { can } = usePermissions();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState({
    status: '',
    priority: '',
  });
  const debouncedSearch = useDebounce(searchTerm, 300);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadTestCases() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams({
          page: page.toString(),
          search: debouncedSearch,
          status: filter.status,
          priority: filter.priority,
        });

        const response = await fetch(
          `/api/projects/${projectId}/test-cases?${queryParams}`
        );
        
        if (!response.ok) throw new Error('Failed to load test cases');
        
        const data = await response.json();
        setTestCases(data.items);
        setTotalPages(data.totalPages);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load test cases',
          status: 'error',
        });
        setError(error instanceof Error ? error : new Error('An unexpected error occurred'));
      } finally {
        setIsLoading(false);
      }
    }

    loadTestCases();
  }, [projectId, page, debouncedSearch, filter, toast]);

  const handleCreateTestCase = useCallback(async (data: CreateTestCase) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, projectId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test case');
      }

      const newTestCase = await response.json();
      setTestCases(prev => [...prev, newTestCase]);
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create test case',
        status: 'error',
      });
    }
  }, [projectId, onClose, toast]);

  const handleUpdateTestCase = useCallback((updatedTestCase: TestCase) => {
    setTestCases(prev => 
      prev.map(tc => tc.id === updatedTestCase.id ? updatedTestCase : tc)
    );
  }, []);

  const handleDeleteTestCase = useCallback((deletedId: string) => {
    setTestCases(prev => prev.filter(tc => tc.id !== deletedId));
  }, []);

  const canCreateTestCase = can(Action.CREATE, Resource.TEST_CASE);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Ctrl/Cmd + N to create new test case
      if ((e.ctrlKey || e.metaKey) && e.key === 'n' && canCreateTestCase) {
        e.preventDefault();
        onOpen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canCreateTestCase, onOpen]);

  if (error) {
    return (
      <ErrorMessage 
        title="Failed to load test cases"
        message={error instanceof Error ? error.message : 'An unexpected error occurred'}
      />
    );
  }

  return (
    <ErrorBoundary>
      <Box>
        <Flex justify="space-between" align="center" mb={6}>
          <Heading size="lg">Test Cases</Heading>
          {canCreateTestCase && (
            <Button
              as={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              colorScheme="blue"
              onClick={onOpen}
              leftIcon={<FiPlus />}
            >
              Create Test Case
            </Button>
          )}
        </Flex>

        <HStack mb={4} spacing={4}>
          <Input
            ref={searchInputRef}
            placeholder="Search test cases... (Ctrl+K)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search test cases"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.currentTarget.blur();
              }
            }}
          />
          <Select
            value={filter.status}
            onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="DEPRECATED">Deprecated</option>
          </Select>
          <Select
            value={filter.priority}
            onChange={(e) => setFilter(prev => ({ ...prev, priority: e.target.value }))}
            aria-label="Filter by priority"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </Select>
        </HStack>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState message="Loading test cases..." />
          ) : testCases.length === 0 ? (
            <EmptyState 
              message="No test cases found"
              actionLabel={canCreateTestCase ? "Create Test Case" : undefined}
              onAction={canCreateTestCase ? onOpen : undefined}
            />
          ) : (
            <MotionStack
              spacing={4}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {testCases.map(testCase => (
                <TestCaseCard
                  key={testCase.id}
                  testCase={testCase}
                  projectId={projectId}
                  onUpdate={handleUpdateTestCase}
                  onDelete={handleDeleteTestCase}
                />
              ))}
            </MotionStack>
          )}
        </AnimatePresence>

        {totalPages > 1 && (
          <Flex justify="center" mt={6}>
            <HStack>
              <Button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                isDisabled={page === 1}
                aria-label="Previous page"
              >
                Previous
              </Button>
              <Text>
                Page {page} of {totalPages}
              </Text>
              <Button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                isDisabled={page === totalPages}
                aria-label="Next page"
              >
                Next
              </Button>
            </HStack>
          </Flex>
        )}
      </Box>
    </ErrorBoundary>
  );
} 