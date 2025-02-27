import { createTypedQueryHook } from '@/lib/hooks/createQueryHook';
import type { TestCase } from '@/types/testCase';
import type { TestCaseFilters } from '@/types/filters';
import { serializeFilters } from '@/types/filters';

interface TestCaseQueryParams extends TestCaseFilters {
  projectId: string;
}

interface TestCaseResponse {
  items: TestCase[];
  totalPages: number;
  currentPage: number;
}

interface _QueryParams {
  projectId: string;
  filters: Omit<TestCaseQueryParams, 'projectId'>;
}

export const useTestCaseQuery = createTypedQueryHook<TestCaseResponse, TestCaseQueryParams>({
  queryKey: (params) => [
    'testCases',
    params.projectId,
    params.status?.join(',') || '',
    params.priority?.join(',') || '',
    params.search || '',
    params.page?.toString() || '1',
    params.limit?.toString() || '10'
  ],
  queryFn: async (params: TestCaseQueryParams) => {
    const { projectId, ...filters } = params;
    const response = await fetch(
      `/api/projects/${projectId}/test-cases?${serializeFilters(filters)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch test cases');
    }

    return response.json();
  },
  enabled: (params) => Boolean(params.projectId)
}); 