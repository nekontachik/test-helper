import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { TestCaseResult } from '@/types';

export function useTestCaseResults(projectId: string, testRunId: string) {
  return useQuery({
    queryKey: ['testCaseResults', projectId, testRunId],
    queryFn: () => apiClient.getTestCaseResults(projectId, testRunId),
  });
}
