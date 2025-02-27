import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectFormData } from '@/types';
import apiClient from '@/lib/apiClient';

export function useProjects(): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects()
  });
}

export function useCreateProject(): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProjectFormData) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useProject(projectId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.getProject(projectId)
  });
}
