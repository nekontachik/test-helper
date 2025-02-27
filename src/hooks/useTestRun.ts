import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { TestRun } from '@/types';

interface QueryResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<QueryResult<T>>;
}

export function useTestRun(projectId?: string, runId?: string): QueryResult<TestRun> {
  return useQuery({
    queryKey: ['testRun', projectId, runId],
    queryFn: () => 
      projectId && runId 
        ? apiClient.getTestRun(projectId, runId)
        : Promise.resolve(undefined),
    enabled: !!projectId && !!runId,
  }) as QueryResult<TestRun>;
}
