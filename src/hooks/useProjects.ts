import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectFormData } from '@/types';
import apiClient from '@/lib/apiClient';
import { useMockApi, mockApi } from '@/lib/mockApi';

export function useProjects(): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (useMockApi) {
        // Return mock data during development
        return mockApi.getProjects();
      }
      return apiClient.getProjects();
    }
  });
}

export function useCreateProject(): ReturnType<typeof useMutation> {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProjectFormData) => {
      if (useMockApi) {
        // Use mock API during development
        return mockApi.createProject(data);
      }
      return apiClient.createProject(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });
}

export function useProject(projectId: string): ReturnType<typeof useQuery> {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: async () => {
      if (useMockApi) {
        // Return mock data during development
        const project = mockApi.getProject(projectId);
        if (!project) {
          throw new Error(`Project with ID ${projectId} not found`);
        }
        return project;
      }
      return apiClient.getProject(projectId);
    },
    enabled: !!projectId
  });
}
