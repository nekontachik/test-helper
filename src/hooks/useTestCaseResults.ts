import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestCaseResult } from '@/types';

interface QueryResult<T> {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<QueryResult<T>>;
}

export function useTestCaseResults(projectId: string, runId: string): QueryResult<TestCaseResult[]> {
  return useQuery({
    queryKey: ['testCaseResults', projectId, runId],
    queryFn: () => apiClient.getTestCaseResults(projectId, runId),
  });
}
