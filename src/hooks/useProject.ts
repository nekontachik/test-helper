import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import type { Project } from '@/types';

interface UseProjectOptions {
  enabled?: boolean;
  retry?: boolean | number;
  staleTime?: number;
  cacheTime?: number;
}

export function useProject(projectId: string | null, options: UseProjectOptions = {}) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await apiClient.get<Project>(`/api/projects/${projectId}`);
      return response;
    },
    enabled: !!projectId && (options.enabled ?? true),
    retry: options.retry ?? 3,
    staleTime: options.staleTime ?? 1000 * 60 * 5, // 5 minutes
    cacheTime: options.cacheTime ?? 1000 * 60 * 30, // 30 minutes
  });
}
