import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export function useProjectCheck(projectId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
    retry: false,
  });
}
