import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCaseResult } from '@/types';

export function useTestCaseResults(projectId: string, runId: string) {
  return useQuery({
    queryKey: ['testCaseResults', projectId, runId],
    queryFn: () => apiClient.getTestCaseResults(projectId, runId),
  });
}
