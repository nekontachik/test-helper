import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useTestCases } from '@/hooks/useTestCases';
import { TestCaseStatus } from '@/types';
import { TestCaseFilters } from '@/components/test-cases/TestCaseFilters';
import { TestCaseTable } from '@/components/test-cases/TestCaseTable';
import { Pagination } from '@/components/ui/pagination';
import { Loading } from '@/components/ui/loading';
import { ErrorMessage } from '@/components/ui/error-message';

interface TestCaseListProps {
  projectId: string;
}

// Move this interface to a shared types file since it's used by TestCaseFilters
export interface TestCaseFilters {
  projectId: string;
  status: TestCaseStatus[];
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export function TestCaseList({ projectId }: TestCaseListProps): JSX.Element {
  const [filters, setFilters] = useState<TestCaseFilters>({
    projectId,
    status: [TestCaseStatus.ACTIVE],
    page: 1,
    limit: 10
  });

  const { data, isLoading, error } = useTestCases(filters);

  if (isLoading) {
    return <Loading text="Loading test cases..." size="lg" />;
  }

  if (error) {
    return <ErrorMessage message={error.message} />;
  }

  return (
    <Box>
      <TestCaseFilters 
        filters={filters} 
        onChange={setFilters} 
      />
      <TestCaseTable 
        testCases={data?.data ?? []} 
        onSort={(field: string) => setFilters((prev: TestCaseFilters) => ({
          ...prev,
          orderBy: { [field]: prev.orderBy?.[field] === 'asc' ? 'desc' : 'asc' }
        }))}
      />
      <Pagination
        currentPage={filters.page}
        totalPages={Math.ceil((data?.total ?? 0) / filters.limit)}
        onPageChange={(page: number) => setFilters((prev: TestCaseFilters) => ({ 
          ...prev, 
          page 
        }))}
      />
    </Box>
  );
}
