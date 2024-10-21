import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  apiClient  from '@/lib/apiClient';
import { Project, ProjectFormData } from '@/types';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'] as const,
    queryFn: () => apiClient.getProjects(),
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newProject: ProjectFormData) => apiClient.createProject(newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] as const });
    },
  });
}
