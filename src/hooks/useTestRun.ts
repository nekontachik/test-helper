import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export function useTestRun(projectId?: string, runId?: string) {
  return useQuery({
    queryKey: ['testRun', projectId, runId],
    queryFn: () => 
      projectId && runId 
        ? apiClient.getTestRun(projectId, runId)
        : Promise.resolve(undefined),
    enabled: !!projectId && !!runId,
  });
}
