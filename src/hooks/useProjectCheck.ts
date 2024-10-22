import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export function useProjectCheck(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
    retry: false,
  });
}
