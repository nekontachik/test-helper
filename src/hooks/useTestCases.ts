import { useQuery } from '@tanstack/react-query';
import  apiClient  from '@/lib/apiClient';
import { TestCase, PaginatedResponse, TestCaseStatus, TestCasePriority } from '@/types';

interface TestCaseFilters {
  status?: TestCaseStatus | null;
  priority?: TestCasePriority | null;
  search?: string;
}

export function useTestCases(
  projectId: string,
  page: number = 1,
  filters: TestCaseFilters = {},
  limit: number = 10
) {
  return useQuery(['testCases', projectId, page, filters], () => 
    apiClient.getTestCases(projectId, { page, limit, ...filters })
  );
}
