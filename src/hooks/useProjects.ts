import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Project, ProjectFormData } from '@/types';
import apiClient from '@/lib/apiClient';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects()
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ProjectFormData) => apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.getProject(projectId)
  });
}
