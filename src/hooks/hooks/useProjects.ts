import useSWR from 'swr';
import type { Project } from '@/types';

interface ProjectsResponse {
  data: Project[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

const fetcher = (url: string): Promise<Project[]> => fetch(url).then((res) => res.json());

export function useProjects(): ProjectsResponse {
  const { data, error, isLoading } = useSWR<Project[]>('/api/projects', fetcher);

  return {
    data,
    isLoading,
    error
  };
}
