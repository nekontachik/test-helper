import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export function useTestRun(projectId?: string, testRunId?: string) {
  return useQuery({
    queryKey: ['testRun', projectId, testRunId],
    queryFn: () => 
      projectId && testRunId 
        ? apiClient.getTestRun(projectId, testRunId)
        : Promise.resolve(undefined),
    enabled: !!projectId && !!testRunId,
  });
}
