import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';
import { useRouter, usePathname } from 'next/navigation';
import { useMockApi, mockApi } from '@/lib/mockApi';
import { useState, useEffect } from 'react';
// import { Project } from '@/types';

export function useProjectCheck(): { isLoading: boolean; hasProjects: boolean } {
  const [hasProjects, setHasProjects] = useState<boolean>(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ['projects-check'],
    queryFn: async () => {
      try {
        if (useMockApi) {
          return mockApi.getProjects();
        }
        return apiClient.getProjects();
      } catch (err) {
        console.error('Error checking for projects:', err);
        return { data: [] };
      }
    },
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !error) {
      const projectsExist = data && data.data && data.data.length > 0;
      setHasProjects(projectsExist);
      
      // Only redirect if we're not already on the projects page and there are no projects
      if (!projectsExist && pathname !== '/projects' && pathname !== '/') {
        router.push('/projects');
      }
    }
  }, [data, isLoading, error, pathname, router]);

  return { 
    isLoading, 
    hasProjects 
  };
}
