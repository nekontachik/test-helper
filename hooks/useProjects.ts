import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';
import { useSession } from 'next-auth/react';
import { Project, PaginatedResponse } from '@/types';

export function useProjects() {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
    onError: (error: Error) => {
      console.error('Error fetching projects:', error);
    },
    enabled: status === 'authenticated',
  });
}
