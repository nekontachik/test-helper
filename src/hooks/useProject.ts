import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { Project } from '@/types';

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId,
  });
}
