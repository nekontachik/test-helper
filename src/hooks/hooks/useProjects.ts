import useSWR from 'swr';
import type { Project } from '@prisma/client';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useProjects() {
  const { data, error, isLoading } = useSWR<Project[]>('/api/projects', fetcher);

  return {
    data,
    isLoading,
    error
  };
}
